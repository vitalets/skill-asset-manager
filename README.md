# skill-asset-manager
CLI to upload and synchronize skill assets (sounds and images).

## Installation
```
npm i -D skill-asset-manager
```

## Usage
```
asset [sync|verify|clean] <type> <target>

Upload changed assets to server and update dbFile

Positionals:
  type    Asset type    [string] [required] [choices: "images", "sounds", "all"]
  target  Target name from config                            [string] [required]

Options:
      --version  Show version number                                   [boolean]
  -c, --config   Path to config file    [string] [default: "./assets.config.js"]
  -y, --yes      Auto confirm                         [boolean] [default: false]
      --help     Show help                                             [boolean]
```

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)
