/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {createRouter, createWebHistory, RouteLocationNormalized, Router, RouteRecordRaw} from 'vue-router'
import MainDashboard from "@/pages/MainDashboard.vue";
import Transactions from "@/pages/Transactions.vue";
import TransactionDetails from "@/pages/TransactionDetails.vue";
import Accounts from "@/pages/Accounts.vue";
import AccountDetails from "@/pages/AccountDetails.vue";
import Tokens from "@/pages/Tokens.vue";
import TokenDetails from "@/pages/TokenDetails.vue";
import Contracts from "@/pages/Contracts.vue";
import ContractDetails from "@/pages/ContractDetails.vue";
import Topics from "@/pages/Topics.vue";
import TopicDetails from "@/pages/TopicDetails.vue";
import NoSearchResult from "@/pages/NoSearchResult.vue";
import PageNotFound from "@/pages/PageNotFound.vue";
import AccountBalances from "@/pages/AccountBalances.vue";
import {AxiosMonitor} from "@/utils/AxiosMonitor";
import TransactionsById from "@/pages/TransactionsById.vue";
import MobileMenu from "@/pages/MobileMenu.vue";
import MobileSearch from "@/pages/MobileSearch.vue";
import Nodes from "@/pages/Nodes.vue";
import NodeDetails from "@/pages/NodeDetails.vue";
import {NetworkEntry, NetworkRegistry, networkRegistry} from "@/schemas/NetworkRegistry";
import {AppStorage} from "@/AppStorage";
import axios from "axios";
import Staking from "@/pages/Staking.vue";
import {RouteManager} from "@/utils/RouteManager";
import {WalletManager} from "@/utils/wallet/WalletManager";
import BlockDetails from "@/pages/BlockDetails.vue";
import Blocks from "@/pages/Blocks.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/' + AppStorage.getLastNetwork().name  + '/dashboard'
  },
  {
    path: '/page-not-found',
    redirect: '/' + AppStorage.getLastNetwork().name + '/page-not-found'
  },
  {
    path: '/:network/page-not-found',
    name: 'PageNotFound',
    component: PageNotFound
  },
  {
    path: '/:network/dashboard',
    name: 'MainDashboard',
    component: MainDashboard,
    props: true
  },
  {
    path: '/:network/transactions',
    name: 'Transactions',
    component: Transactions,
    props: true
  },
  {
    path: '/:network/transactionsById/:transactionId',
    name: 'TransactionsById',
    component: TransactionsById,
    props: true
  },
  {
    path: '/:network/transaction/:transactionLoc',
    name: 'TransactionDetails',
    component: TransactionDetails,
    props: route => ({
      network: route.params.network as string|undefined,
      transactionLoc: route.params.transactionLoc as string|undefined,
      transactionId: route.query.tid as string|undefined
    })
  },
  {
    path: '/:network/accounts',
    name: 'Accounts',
    component: Accounts,
    props: true
  },
  {
    path: '/:network/account/:accountId',
    name: 'AccountDetails',
    component: AccountDetails,
    props: true
  },
  {
    // EIP 3091 Support
    path: '/:network/address/:accountAddress',
    redirect: to => '/' + to.params.network + '/account/' + to.params.accountAddress
  },
  {
    path: '/:network/accountbalances/:accountId',
    name: 'AccountBalances',
    component: AccountBalances,
    props: true
  },
  {
    path: '/:network/tokens',
    name: 'Tokens',
    component: Tokens,
    props: true
  },
  {
    path: '/:network/token/:tokenId',
    name: 'TokenDetails',
    component: TokenDetails,
    props: true
  },
  {
    path: '/:network/contracts',
    name: 'Contracts',
    component: Contracts,
    props: true
  },
  {
    path: '/:network/contract/:contractId',
    name: 'ContractDetails',
    component: ContractDetails,
    props: true
  },
  {
    path: '/:network/topics',
    name: 'Topics',
    component: Topics,
    props: true
  },
  {
    path: '/:network/topic/:topicId',
    name: 'TopicDetails',
    component: TopicDetails,
    props: true
  },
  {
    path: '/:network/nodes',
    name: 'Nodes',
    component: Nodes,
    props: true
  },
  {
    path: '/:network/node/:nodeId',
    name: 'NodeDetails',
    component: NodeDetails,
    props: true
  },
  {
    path: '/:network/staking',
    name: 'Staking',
    component: Staking,
    props: true
  },
  {
    path: '/:network/blocks',
    name: 'Blocks',
    component: Blocks,
    props: true
  },
  {
    path: '/:network/block/:blockHon',
    name: 'BlockDetails',
    component: BlockDetails,
    props: true
  },
  {
    // EIP 3091 Support
    path: '/:network/tx/:transactionLoc',
    name: 'TransactionDetails3091',
    component: TransactionDetails,
    props: true
  },
  {
    path: '/:network/search-result/:searchedId',
    name: 'NoSearchResult',
    component: NoSearchResult,
    props:  route => ({
      network: route.params.network as string|undefined,
      searchedId: route.params.searchedId as string|undefined,
      errorCount: Number(route.query.errorCount) as number|undefined
    })
  },
  {
    path: '/:network/mobile-menu',
    name: 'MobileMenu',
    component: MobileMenu,
    props: true
  },
  {
    path: '/:network/mobile-search',
    name: 'MobileSearch',
    component: MobileSearch,
    props: true
  },
  {
    path: "/:catchAll(.*)",
    redirect: '/page-not-found'
  },
]

export function makeRouter(): Router {
  return createRouter({
    history: createWebHistory(),
    routes
  })
}

const router = makeRouter()

router.beforeEach((to) => {
  let result: boolean | string

  if (to.name === 'Staking' && process.env.VUE_APP_ENABLE_STAKING !== 'true') {
    // Staking page not enabled => re-route to PageNotFound
    result = "/page-not-found"
  } else {
    result = true
  }
  return result
})

router.beforeEach((to, from) => {
  let result: boolean | string

  const toEntry = getNetworkEntryFromRoute(to)
  const fromEntry = getNetworkEntryFromRoute(from)

  if (toEntry !== null) {
    // Network is valid
    AppStorage.setLastNetwork(toEntry)
    axios.defaults.baseURL = toEntry.url

    if (toEntry.name == NetworkRegistry.TEST_NETWORK) {
      document.documentElement.style.setProperty('--h-theme-background-color', 'var(--h-testnet-background-color)')
      document.documentElement.style.setProperty('--h-theme-highlight-color', 'var(--h-testnet-highlight-color)')
      document.documentElement.style.setProperty('--h-theme-pagination-background-color', 'var(--h-testnet-pagination-background-color)')
      document.documentElement.style.setProperty('--h-theme-box-shadow-color', 'var(--h-testnet-box-shadow-color)')
      document.documentElement.style.setProperty('--h-theme-dropdown-arrow', 'var(--h-testnet-dropdown-arrow)')
    } else if (toEntry.name == NetworkRegistry.PREVIEW_NETWORK) {
      document.documentElement.style.setProperty('--h-theme-background-color', 'var(--h-previewnet-background-color)')
      document.documentElement.style.setProperty('--h-theme-highlight-color', 'var(--h-previewnet-highlight-color)')
      document.documentElement.style.setProperty('--h-theme-pagination-background-color', 'var(--h-previewnet-pagination-background-color)')
      document.documentElement.style.setProperty('--h-theme-box-shadow-color', 'var(--h-previewnet-box-shadow-color)')
      document.documentElement.style.setProperty('--h-theme-dropdown-arrow', 'var(--h-previewnet-dropdown-arrow)')
    } else {
      document.documentElement.style.setProperty('--h-theme-background-color', 'var(--h-mainnet-background-color)')
      document.documentElement.style.setProperty('--h-theme-highlight-color', 'var(--h-mainnet-highlight-color)')
      document.documentElement.style.setProperty('--h-theme-pagination-background-color', 'var(--h-mainnet-pagination-background-color)')
      document.documentElement.style.setProperty('--h-theme-box-shadow-color', 'var(--h-mainnet-box-shadow-color)')
      document.documentElement.style.setProperty('--h-theme-dropdown-arrow', 'var(--h-mainnet-dropdown-arrow)')
    }

    if (fromEntry != null && fromEntry != toEntry) {
      // Network is changing => updates AppStorage and axios
      if (to.name != "MainDashboard" && to.name != "PageNotFound") {
        // We re-route on MainDashboard
        result = "/" + toEntry.name + "/dashboard"
      } else {
        result = true
      }
    } else (
        result = true
    )
  } else {
    // Network is invalid => page not found
    result = '/page-not-found'
  }
  return result
})

router.beforeEach((to) => {
  const titleSuffix = process.env.VUE_APP_DOCUMENT_TITLE_SUFFIX ? " | " + process.env.VUE_APP_DOCUMENT_TITLE_SUFFIX : ""

  switch (to.name as string) {
    case "MainDashboard":
      document.title = "Hedera Dashboard" + titleSuffix
      break;
    case "TransactionDetails":
      document.title = "Hedera Transaction " + (to.query.tid ?? to.params.transactionLoc) + titleSuffix
      break;
    case "TransactionDetails3091":
      document.title = "Hedera Transaction " + to.params.transactionLoc + titleSuffix
      break;
    case "TokenDetails":
      document.title = "Hedera Token " + to.params.tokenId + titleSuffix
      break;
    case "TopicDetails":
      document.title = "Hedera Topic " + to.params.topicId + titleSuffix
      break;
    case "ContractDetails":
      document.title = "Hedera Contract " + to.params.contractId + titleSuffix
      break;
    case "AccountDetails":
      document.title = "Hedera Account " + to.params.accountId + titleSuffix
      break;
    case "AccountBalances":
      document.title = "Balances for Hedera Account " + to.params.accountId + titleSuffix
      break;
    case "NodeDetails":
      document.title = "Hedera Node " + to.params.nodeId + titleSuffix
      break;
    case "BlockDetails":
      document.title = "Hedera Block " + to.params.blockHon + titleSuffix
      break;
    case "NoSearchResult":
      document.title = "Search Results" + titleSuffix
      break;
    case "PageNotFound":
      document.title = "Page Not Found" + titleSuffix
      break;
    default:
      document.title = "Hedera " + (to.name as string) + titleSuffix
  }

  addMetaTags()
});

router.beforeEach(() => {
  AxiosMonitor.instance.clearErrorResponses()
})

export default router

export function addMetaTags(): void {

  const title = document.title
  const description = process.env.VUE_APP_META_DESCRIPTION
      ?? "Hedera Mirror Node Explorer is a ledger explorer for the Hedera network"
  const url = process.env.VUE_APP_META_URL

  createOrUpdateTagName('description', description)
  createOrUpdateTagProperty('og:title', title)
  if (url) {
    createOrUpdateTagProperty('og:url', url)
  }
}

export function createOrUpdateTagName(name: string, content: string): void {
  const header = document.getElementsByTagName('head')[0]
  for (const tag of document.getElementsByTagName('meta')) {
    if (tag.getAttribute('name') === name) {
      header.removeChild(tag)
    }
  }
  const newTag = document.createElement('meta')
  newTag.name = name
  newTag.setAttribute('content', content)
  header.appendChild(newTag)
}

export function createOrUpdateTagProperty(property: string, content: string): void {
  const header = document.getElementsByTagName('head')[0]
  for (const tag of document.getElementsByTagName('meta')) {
    if (tag.getAttribute('property') === property) {
      header.removeChild(tag)
    }
  }
  const newTag = document.createElement('meta')
  newTag.setAttribute('property', property)
  newTag.setAttribute('content', content)
  header.appendChild(newTag)
}

export function getNetworkEntryFromRoute(r: RouteLocationNormalized): NetworkEntry | null {

  let networkName: string|null
  const networkParam = r.params.network
  if (Array.isArray(networkParam)) {
    networkName = networkParam.length >= 1 ? networkParam[0] : null
  } else {
    networkName = networkParam
  }

  return networkName !== null ? networkRegistry.lookup(networkName) : null
}

export function getNetworkEntryFromCurrentRoute(): NetworkEntry {
  return getNetworkEntryFromRoute(router.currentRoute.value) ?? networkRegistry.getDefaultEntry()
}

export const routeManager = new RouteManager(router)
export const walletManager = new WalletManager(routeManager)
