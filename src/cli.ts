#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Config } from './config';
import { Runner } from '.';
import { AssetType } from './types';

type PositionalArgs = {
  type: CliAssetType;
  target: string;
}

type CliAssetType = AssetType | 'all';

const options = yargs(hideBin(process.argv))
  .command<PositionalArgs>(
    'sync <type> <target>',
    'Upload changed assets to server and update dbFile',
    setPositionalArgs
  )
  .command<PositionalArgs>(
    'clean <type> <target>',
    'Delete unused assets from server',
    setPositionalArgs
  )
  .example('$0 sync images target-skill', 'Synchronize images for target-skill')
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Path to config file',
    default: './assets.config.js',
  })
  .demandCommand()
  .help()
  .locale('en')
  .parseSync();

function setPositionalArgs(yargs: Argv) {
  yargs.positional('type', {
    describe: 'Asset type',
    type: 'string',
    choices: [ ...Object.keys(AssetType), 'all' ],
  }).positional('target', {
    describe: 'Target name from config',
    type: 'string',
  });
}

main();

async function main() {
  const { type, target, _, config: configPath } = options;
  const config = new Config(configPath);
  await config.load();
  const targetNames = target.split(',');
  const assetTypes = (type === 'all' ? Object.keys(AssetType) as AssetType[] : [ type ]);
  const command = _[0];
  for (const targetName of targetNames) {
    for (const assetType of assetTypes) {
      await runCommandForTarget(config, assetType, targetName, command);
    }
  }
}

async function runCommandForTarget(config: Config, assetType: AssetType, targetName: string, command: string | number) {
  const runner = new Runner(config, assetType, targetName);
  switch (command) {
    case 'sync': return runner.sync();
    case 'clean': return runner.clean();
    // case 'verify': return manager.verify();
    default: throw new Error(`Unknown command: ${command}`);
  }
}
