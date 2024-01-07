use std::mem::size_of_val;
use std::{env, mem};

use winapi::shared::basetsd::UINT_PTR;
use winapi::shared::minwindef::{FALSE, UINT};
use winapi::shared::windef::RECT;
use winapi::um::handleapi::CloseHandle;
use winapi::um::tlhelp32::{
    CreateToolhelp32Snapshot, Process32First, Process32Next, PROCESSENTRY32, TH32CS_SNAPPROCESS,
};
use winapi::um::winuser::{
    AdjustWindowRect, DispatchMessageA, GetMessageA, GetWindowLongA, GetWindowPlacement, KillTimer,
    PostQuitMessage, SetTimer, SetWinEventHook, SetWindowPlacement, SetWindowPos, TranslateMessage,
    UnhookWinEvent, EVENT_SYSTEM_FOREGROUND, GWL_STYLE, MSG, SWP_NOMOVE, SWP_NOZORDER, SW_RESTORE,
    WINDOWPLACEMENT, WINEVENT_OUTOFCONTEXT, WPF_ASYNCWINDOWPLACEMENT,
};
use winapi::{
    shared::{
        minwindef::DWORD,
        ntdef::LONG,
        windef::{HWINEVENTHOOK, HWND},
    },
    um::winuser::GetWindowThreadProcessId,
};

static mut TARGET_PID: u32 = 0;
static mut TARGET_WIDTH: i32 = 0;
static mut TARGET_HEIGHT: i32 = 0;
static mut TARGET_PID_CHILDREN: Vec<u32> = vec![];

fn main() {
    let args: Vec<_> = env::args().collect();

    if args.len() < 4 {
        return;
    }

    unsafe {
        TARGET_PID = args[1].parse::<u32>().unwrap();
        TARGET_WIDTH = args[2].parse::<i32>().unwrap();
        TARGET_HEIGHT = args[3].parse::<i32>().unwrap();
    }

    extern "system" fn wineventproc(
        _: HWINEVENTHOOK,
        _: DWORD,
        hwnd: HWND,
        _: LONG,
        _: LONG,
        _: DWORD,
        _: DWORD,
    ) {
        let mut pid: u32 = 0;
        unsafe {
            GetWindowThreadProcessId(hwnd, &mut pid);

            let mut flag = false;
            if TARGET_PID == pid {
                flag = true;
            } else {
                if TARGET_PID_CHILDREN.len() > 0 {
                    for i in &TARGET_PID_CHILDREN {
                        if pid == *i {
                            flag = true;
                            break;
                        }
                    }
                } else {
                    let hp = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
                    let mut pe: PROCESSENTRY32 = mem::zeroed();
                    pe.dwSize = size_of_val(&pe) as u32;
                    if Process32First(hp, &mut pe) > 0 {
                        loop {
                            if pe.th32ParentProcessID == TARGET_PID {
                                TARGET_PID_CHILDREN.push(pe.th32ProcessID);

                                if pid == pe.th32ProcessID {
                                    flag = true;
                                    break;
                                }
                            }

                            if Process32Next(hp, &mut pe) == 0 {
                                break;
                            }
                        }
                    }
                    CloseHandle(hp);
                }
            }

            if flag {
                let style = GetWindowLongA(hwnd, GWL_STYLE) as u32;

                let mut rect: RECT = mem::zeroed();
                rect.left = 0;
                rect.top = 0;
                rect.right = rect.left + TARGET_WIDTH;
                rect.bottom = rect.top + TARGET_HEIGHT;
                AdjustWindowRect(&mut rect, style, FALSE);

                let mut pl: WINDOWPLACEMENT = mem::zeroed();
                GetWindowPlacement(hwnd, &mut pl);
                pl.flags = WPF_ASYNCWINDOWPLACEMENT;
                pl.rcNormalPosition.right = pl.rcNormalPosition.left + rect.right - rect.left;
                pl.rcNormalPosition.bottom = pl.rcNormalPosition.top + rect.bottom - rect.top;
                pl.showCmd = SW_RESTORE as u32;
                SetWindowPlacement(hwnd, &mut pl);

                SetWindowPos(
                    hwnd,
                    std::ptr::null_mut(),
                    0,
                    0,
                    rect.right - rect.left,
                    rect.bottom - rect.top,
                    SWP_NOMOVE | SWP_NOZORDER,
                );

                PostQuitMessage(0);
            }
        }
    }

    extern "system" fn timerproc(_: HWND, _: UINT, _: UINT_PTR, _: DWORD) {
        unsafe {
            PostQuitMessage(0);
        }
    }
    unsafe {
        let hook = SetWinEventHook(
            EVENT_SYSTEM_FOREGROUND,
            EVENT_SYSTEM_FOREGROUND,
            std::ptr::null_mut(),
            Some(wineventproc),
            0,
            0,
            WINEVENT_OUTOFCONTEXT,
        );
        let timer = SetTimer(std::ptr::null_mut(), 1, 30000, Some(timerproc));
        let mut msg: MSG = mem::zeroed();
        while GetMessageA(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {
            TranslateMessage(&msg);
            DispatchMessageA(&msg);
        }
        UnhookWinEvent(hook);
        KillTimer(std::ptr::null_mut(), timer);
    }
}
