#!/usr/bin/env node

import meow from 'meow'
import { createBranch } from '../commands/createBranch.js'
import { deleteBranch } from '../commands/deleteBranch.js'
import { getBranchUrl } from '../commands/getBranchUrl.js'
import { postCheckout } from '../commands/postCheckout.js'
import { prepareEnv } from '../commands/prepareEnv.js'
import { promoteBranch } from '../commands/promoteBranch.js'
import { log } from '../lib/log.js'
import { CliFlags } from '../lib/types.js'

const cli = meow(
  `
  Usage
    $ shape <command> <flags>

  Commands
    create-branch
    promote-branch
    delete-branch
    get-branch-url
    post-checkout
    prepare-env

  Flags
    --name       A branch name. create-branch, delete-branch, promote-branch
    --lookup-pr  Use a SHA to lookup a branch name. promote-branch only.

  Examples
    $ shape create-branch --name my_branch
`,
  {
    importMeta: import.meta,
    flags: {
      name: {
        type: 'string',
      },
      lookupPr: {
        type: 'boolean',
      },
    },
  },
)

function main(command: string | undefined, flags: CliFlags) {
  switch (command) {
    case 'create-branch':
      createBranch(flags)
      return
    case 'promote-branch':
      promoteBranch(flags)
      return
    case 'delete-branch':
      deleteBranch(flags)
      return
    case 'get-branch-url':
      getBranchUrl()
      return
    case 'post-checkout':
      postCheckout()
      return
    case 'prepare-env':
      prepareEnv()
      return
    default:
      log.info('Unrecognized command')
  }
}

main(cli.input[0], cli.flags)
