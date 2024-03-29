import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Config, ConfigOptions, getConfig } from '../../lib/config'
import { handler as createBranch } from '../createBranch'
import { handler as postCheckoutHook } from '../postCheckoutHook'

vi.mock('../createBranch.js')
vi.mock('../../lib/config.js')
vi.mock('../../lib/log.js')
vi.mock('../../lib/client.js')

describe('postCheckoutHook', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.mocked(getConfig).mockImplementationOnce(({ flags }: ConfigOptions = {}) => {
      return {
        noTtyShouldCreateBranch: true,
        ...flags,
      } as Config
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('can create an api branch using a provided name', async () => {
    const branchName = 'my_branch'

    await postCheckoutHook({ name: branchName, tty: false })

    expect(createBranch).toHaveBeenCalledWith({ name: branchName })
  })
})
