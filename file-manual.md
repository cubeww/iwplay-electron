# iwplay -- 文件系统说明书

LibraryPath目录由用户定义，用来存放游戏文件（common）、游戏引导文件（iwmanifest）

- LibraryPath/
  - iwapps/
    - common/
      - 10758/
      - I Wanna Be The GGM.exe
      - ...gamefolders
    -  iwmanifest_10758.json
    - ...gamemanifests
- iwplay-library.json

------

AppDataPath位于%localappdata%下（通常为%localappdata%/iwplay），用来存放iwplay的配置、用户数据

用户数据包括游戏的运行时间、游戏通关状态，以后可能会有云存档

- AppDataPath/
  - userdata/
    - 761397398/
      - 10758/
        - remotecache.json
      - ...gamedatafolders
    - ...users
  - appcache/
    - delfruit-fangamelist.json
  - iwplay-config.json
