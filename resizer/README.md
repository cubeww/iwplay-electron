# Resizer

The resizer can change the window size of the specified pid. It uses SetWinEventHook to get the handle of the target window, and uses SetWindowPlacement and SetWindowPos to set the window size.

## Usage

```sh
resizer.exe [PID] [Width] [Height]
```

Width and Height are the actual sizes in pixels.

IWPlay will run this program when starting the game, which can be used to change the window size when needed.