#!/usr/bin/env node

import { CommandModule } from 'yargs'
import { getClient } from '../lib/client.js'
import { ensureCoreConfig } from '../lib/config.js'
import { DEVELOPMENT } from '../lib/constants.js'
import { runIfConfigured } from '../lib/handler.js'
import { log } from '../lib/log.js'
import { fatal } from '../lib/process.js'
import { getCommitInfo, isDefaultBranch } from '../lib/repo.js'

type Args = {
  debug?: boolean
  name?: string
}

export async function handler({ name, ...flags }: Args) {
  try {
    const { adminUrl, apiKey, env, projectId } = ensureCoreConfig({ flags })
    const { gitCommitRef } = await getCommitInfo(env)

    let branchName: string | undefined

    if (name) {
      log.debug('Using name', name)
      branchName = name
    } else if (gitCommitRef) {
      log.debug('Using found gitCommitRef', gitCommitRef)
      branchName = gitCommitRef
    } else {
      throw new Error(`A --name arg must be provided if not used in a repo`)
    }

    log.debug('Proceeding with branchName:', branchName)

    if (isDefaultBranch(branchName)) {
      log.info(`Cannot delete the 'production' branch`)
      return
    }

    log.info('Deleting API branch...')

    const client = getClient({ adminUrl, apiKey })

    const result = await client.deleteBranch({
      input: { projectId, environment: DEVELOPMENT, branchName },
    })

    if (result?.deletedBranch) {
      log.info(`Deleted the API branch '${result.deletedBranch.branchName}'`)
      return
    }

    log.info('No API branches were deleted')
  } catch (error) {
    log.debug(error)

    if (error instanceof Error) {
      log.error(error.message)
    }

    fatal()
  }
}

export const deleteBranch: CommandModule<unknown, Args> = {
  command: 'delete-branch',
  describe: 'Delete an API branch',
  builder: {
    name: {
      describe: 'A specific branch name to use, instead of finding a value from your env',
      type: 'string',
      demand: false,
    },
    debug: {
      describe: 'Provide debug logging',
      type: 'boolean',
      demand: false,
    },
  },
  handler: runIfConfigured<Args>(handler),
}
