#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Config } from './config';
import { Runner } from '.';
import { AssetType } from './types';

type PositionalArgs = {
  asset: CliAssetType;
  target: string;
}

const ALL = 'all';

type CliAssetType = AssetType | typeof ALL;

const options = yargs(hideBin(process.argv))
  .command<PositionalArgs>('sync <asset> <target>', 'Upload changed assets', setPositionalArgs)
  .command<PositionalArgs>('clean <asset> <target>', 'Delete unused assets', setPositionalArgs)
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Path to config file',
    default: './assets.config.js',
  })
  .demandCommand()
  .help()
  .parseSync();

function setPositionalArgs(yargs: Argv) {
  yargs.positional('asset', {
    describe: 'Asset type',
    type: 'string',
    choices: [ ...Object.keys(AssetType), ALL ],
  }).positional('target', {
    describe: 'Target name from config',
    type: 'string',
  });
}

main();

async function main() {
  const { asset, target, _, config: configPath } = options;
  const config = new Config(configPath);
  await config.load();
  const targetNames = target.split(',');
  const assetTypes = (asset === ALL ? Object.keys(AssetType) : [ asset ]) as AssetType[];
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
