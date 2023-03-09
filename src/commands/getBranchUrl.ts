#!/usr/bin/env node

import { getBranchForLocal, tagBranchForBuild } from '../lib/branches.js'
import { getClient } from '../lib/client.js'
import { getConfig } from '../lib/config.js'
import { log } from '../lib/log.js'
import { BranchWithUrl } from '../lib/types.js'

const { apiKey, env } = getConfig()

export async function getBranchUrl() {
  try {
    if (!apiKey) {
      return
    }

    const client = getClient({ apiKey })

    let branch: BranchWithUrl | undefined

    if (env === 'local') {
      branch = await getBranchForLocal(client)
    } else {
      branch = await tagBranchForBuild(client)
    }

    if (branch) {
      // eslint-disable-next-line no-console
      console.log(branch.graphqlUrl)
    }
  } catch (error) {
    log.debug(error)
  }
}