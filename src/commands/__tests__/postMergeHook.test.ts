import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Client, getClient } from '../../lib/client'
import { ConfigOptions, CoreConfig, ensureCoreConfig } from '../../lib/config'
import { ADMIN_URL, DEVELOPMENT } from '../../lib/constants'
import { getMergedBranchName, isDefaultBranch } from '../../lib/repo'
import { BranchWithLatestVersion } from '../../lib/types'
import { handler as postMergeHook } from '../postMergeHook'
import { handler as promoteBranch } from '../promoteBranch'

vi.mock('../promoteBranch.js')
vi.mock('../../lib/config.js')
vi.mock('../../lib/log.js')
vi.mock('../../lib/client.js')
vi.mock('../../lib/repo.js')

describe('postMergeHook', () => {
  const branchName = 'my_branch'

  const branch = {
    environment: DEVELOPMENT,
    branchName,
    graphqlUrl: 'https://api.takeshape.io/graphql',
  } as BranchWithLatestVersion

  let client: Client

  beforeEach(() => {
    vi.resetModules()

    const projectId = 'project-id'
    const env = 'local'
    const apiKey = 'api-key'
    const adminUrl = ADMIN_URL

    vi.mocked(ensureCoreConfig).mockImplementationOnce(({ flags }: ConfigOptions = {}) => {
      return {
        adminUrl,
        apiKey,
        env,
        githubToken: 'token',
        noTtyShouldPromoteBranch: true,
        projectId,
        ...flags,
      } as CoreConfig
    })

    vi.mocked(isDefaultBranch).mockReturnValueOnce(false)

    client = getClient({ adminUrl, apiKey })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('can merge an api branch using a provided name', async () => {
    vi.mocked(client.getBranch).mockResolvedValueOnce(branch)

    await postMergeHook({ name: branchName, tty: false })

    expect(promoteBranch).toHaveBeenCalledWith({
      name: branchName,
      lookupPr: false,
      productionOnly: false,
    })
  })

  it('can merge an api branch using a name from the repo log', async () => {
    vi.mocked(client.getBranch).mockResolvedValueOnce(branch)
    vi.mocked(getMergedBranchName).mockResolvedValueOnce(branchName)

    await postMergeHook({ tty: false })

    expect(promoteBranch).toHaveBeenCalledWith({
      name: branchName,
      lookupPr: false,
      productionOnly: false,
    })
  })
})
