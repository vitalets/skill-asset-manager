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
    'verify <type> <target>',
    'Verify that all used assets are uploaded on server',
    setPositionalArgs
  )
  .command<PositionalArgs>(
    'clean <type> <target>',
    'Delete unused assets from server',
    setPositionalArgs
  )
  .example('$0 sync images alice-prod', 'Synchronize images for alice-prod')
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Path to config file',
    default: './assets.config.js',
  })
  .strict()
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
    case 'verify': return runner.verify();
    case 'clean': return runner.clean();
    default: throw new Error(`Unknown command: ${command}`);
  }
}
