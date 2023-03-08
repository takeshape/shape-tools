#!/usr/bin/env node

import minimist, { ParsedArgs } from 'minimist'
import { isDefaultBranch } from '../lib/branches.js'
import { getClient } from '../lib/client.js'
import { DEVELOPMENT } from '../lib/constants.js'
import { getHeadBranchName } from '../lib/repo.js'
import { getConfig, logWithPrefix as log } from '../lib/util.js'

const { apiKey, projectId } = getConfig()

async function main({ name }: ParsedArgs) {
  try {
    if (!apiKey) {
      log('TAKESHAPE_API_KEY not set')
      return
    }

    const headBranchName = await getHeadBranchName()

    let branchName = name

    if (name) {
      branchName = name
    } else if (headBranchName) {
      branchName = headBranchName
    } else {
      log(`A --name arg must be provided if not used in a repo`)
      return
    }

    if (await isDefaultBranch(branchName)) {
      log(`Cannot delete the 'production' branch`)
      return
    }

    log('Deleting API branch...')

    const client = getClient({ apiKey })

    const result = await client.deleteBranch({
      input: { projectId, environment: DEVELOPMENT, branchName },
    })

    if (result?.deletedBranch) {
      log(`Deleted the API branch '${result.deletedBranch.branchName}'`)
      return
    }

    log('No API branches were deleted')
  } catch (error) {
    log('Unable to delete the API branch')
  }
}

main(minimist(process.argv.slice(2)))
