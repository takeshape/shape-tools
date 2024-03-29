import { gql, GraphQLClient } from 'graphql-request'
import { Config } from './config.js'
import { formatErrorMessage } from './errors.js'
import { log } from './log.js'
import {
  Branch,
  BranchArgs,
  BranchWithLatestVersion,
  BranchWithUrl,
  DevelopmentBranch,
  DevelopmentBranchWithUrl,
} from './types.js'
import { dump } from './util.js'

type GetBranchQueryPayload = {
  result: BranchWithLatestVersion
}

export const getBranchQuery = gql`
  query GetSchemaBranchQuery(
    $environment: TSSchemaBranchEnvironment!
    $branchName: String
    $projectId: String!
  ) {
    result: getSchemaBranch(
      projectId: $projectId
      environment: $environment
      branchName: $branchName
    ) {
      environment
      branchName
      graphqlUrl
      latestVersion {
        branchName
        environment
        graphqlUrl
        version
      }
    }
  }
`

export type TagBranchMutationVariables = {
  input: BranchArgs & {
    tagName: string
  }
}

type TagBranchMutationPayload = {
  result: {
    branchVersion: BranchWithUrl
  }
}

export const tagBranchMutation = gql`
  mutation TagBranchMutation($input: TSCreateSchemaBranchTagInput!) {
    result: createSchemaBranchTag(input: $input) {
      branchVersion {
        environment
        branchName
        graphqlUrl
      }
    }
  }
`

type CreateBranchMutationVariables = {
  input: BranchArgs
}

type CreateBranchMutationPayload = {
  result: {
    branch: DevelopmentBranchWithUrl
  }
}

export const createBranchMutation = gql`
  mutation CreateBranchMutation($input: TSCreateSchemaBranchInput!) {
    result: createSchemaBranch(input: $input) {
      branch {
        environment
        branchName
        graphqlUrl
      }
    }
  }
`

type DeleteBranchMutationVariables = {
  input: BranchArgs
}

type DeleteBranchMutationPayload = {
  result: {
    deletedBranch: DevelopmentBranch
  }
}

export const deleteBranchMutation = gql`
  mutation DeleteBranchMutation($input: TSDeleteSchemaBranchInput!) {
    result: deleteSchemaBranch(input: $input) {
      deletedBranch {
        environment
        branchName
      }
    }
  }
`

type MergeBranchMutationVariables = {
  input: {
    deleteMergedHead: boolean
    projectId: string
    head: Branch
    base: Branch
    target: Branch & {
      version: number
    }
  }
}

type MergeBranchMutationPayload = {
  result: {
    deletedBranch: DevelopmentBranch
    mergedBranch: Branch
  }
}

export const mergeBranchMutation = gql`
  mutation MergeBranchMutation($input: TSMergeSchemaBranchInput!) {
    result: mergeSchemaBranch(input: $input) {
      deletedBranch {
        environment
        branchName
      }
      mergedBranch {
        environment
        branchName
      }
    }
  }
`

export type Client = ReturnType<typeof getClient>

export type ClientConfig = Pick<Config, 'adminUrl' | 'apiKey'>

export function getClient({ adminUrl, apiKey }: ClientConfig) {
  const client = new GraphQLClient(adminUrl, { headers: { Authorization: `Bearer ${apiKey}` } })

  return {
    async getBranch(variables: BranchArgs) {
      if (!apiKey) {
        return
      }

      try {
        log.debug('getBranch', dump({ variables }))

        const { result } = await client.request<GetBranchQueryPayload, BranchArgs>(
          getBranchQuery,
          variables,
        )

        log.debug('getBranch', dump({ result }))

        return result
      } catch (error) {
        log.debug(error)
        throw new Error(formatErrorMessage(error))
      }
    },
    async tagBranch(variables: TagBranchMutationVariables) {
      if (!apiKey) {
        return
      }

      try {
        log.debug('tagBranch', dump({ variables }))

        const { result } = await client.request<
          TagBranchMutationPayload,
          TagBranchMutationVariables
        >(tagBranchMutation, variables)

        log.debug('tagBranch', dump({ result }))

        return result
      } catch (error) {
        log.debug(error)

        throw new Error(formatErrorMessage(error))
      }
    },
    async createBranch(variables: CreateBranchMutationVariables) {
      if (!apiKey) {
        return
      }

      try {
        log.debug('createBranch', dump({ variables }))

        const { result } = await client.request<
          CreateBranchMutationPayload,
          CreateBranchMutationVariables
        >(createBranchMutation, variables)

        log.debug('createBranch', dump({ result }))

        return result
      } catch (error) {
        log.debug(error)
        throw new Error(formatErrorMessage(error))
      }
    },
    async deleteBranch(variables: DeleteBranchMutationVariables) {
      if (!apiKey) {
        return
      }

      try {
        log.debug('deleteBranch', dump({ variables }))

        const { result } = await client.request<
          DeleteBranchMutationPayload,
          DeleteBranchMutationVariables
        >(deleteBranchMutation, variables)

        log.debug('deleteBranch', dump({ result }))

        return result
      } catch (error) {
        log.debug(error)
        throw new Error(formatErrorMessage(error))
      }
    },
    async mergeBranch(variables: MergeBranchMutationVariables) {
      if (!apiKey) {
        return
      }

      try {
        log.debug('mergeBranch', dump({ variables }))

        const { result } = await client.request<
          MergeBranchMutationPayload,
          MergeBranchMutationVariables
        >(mergeBranchMutation, variables)

        log.debug('mergeBranch', dump({ result }))

        return result
      } catch (error) {
        log.debug(error)
        throw new Error(formatErrorMessage(error))
      }
    },
  }
}
