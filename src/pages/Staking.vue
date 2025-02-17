<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -      http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -
  -->

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>

  <StakingDialog v-model:show-dialog="showStakingDialog"
                 :account="account"
                 :currently-staked-to="stakedTo"
                 v-on:change-staking="handleChangeStaking"/>

  <ConfirmDialog v-model:show-dialog="showStopConfirmDialog" @onConfirm="handleStopStaking"
                 :main-message="'Do you want to stop staking to ' + stakedTo +'?'">
    <template v-slot:dialogTitle>
            <span class="h-is-primary-title">My Staking </span>
            <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
            <span v-if="accountId" class="h-is-secondary-text has-text-weight-light mr-3">{{ accountId }}</span>
    </template>
  </ConfirmDialog>

  <ProgressDialog v-model:show-dialog="showProgressDialog"
                  :mode="progressDialogMode"
                  :main-message="progressMainMessage"
                  :extra-message="progressExtraMessage"
                  :extra-transaction-hash="progressExtraTransactionHash"
                  :show-spinner="showProgressSpinner"
  >
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">{{ progressDialogTitle }}</span>
    </template>
  </ProgressDialog>

  <CSVDownloadDialog v-if="accountId"
                     v-model:show-dialog="showDownloadDialog"
                     :downloader="downloader"
                     :account-id="accountId"/>

  <WalletChooser v-model:show-dialog="showWalletChooser"
                 v-on:choose-wallet="handleChooseWallet"/>

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
          <span class="h-is-primary-title">My Staking </span>
          <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
          <div v-if="accountId" class="h-is-secondary-text has-text-weight-light is-inline-block">
            <AccountLink :account-id="accountId">{{ accountId }}</AccountLink>
          </div>
          <span v-if="accountChecksum" class="has-text-grey mr-3" style="font-size: 28px">-{{ accountChecksum }}</span>
      </template>

      <template v-slot:content>

        <template v-if="accountId">
          <div v-if="isSmallScreen">
            <div class="is-flex is-justify-content-space-between">
              <NetworkDashboardItem :name="stakePeriodStart ? ('since ' + stakePeriodStart) : null"
                                    title="Staked to"
                                    :value="stakedTo"/>

              <NetworkDashboardItem class="ml-4"
                                    :name="stakedAmount ? 'HBAR' : ''"
                                    title="My Stake"
                                    :value="stakedAmount"/>

              <NetworkDashboardItem v-if="!ignoreReward && declineReward && !pendingReward"
                                    class="ml-4"
                                    title="Rewards"
                                    value="Declined"/>
              <NetworkDashboardItem v-else
                                    class="ml-4"
                                    title="Pending Reward"
                                    :name="pendingReward ? 'HBAR' : ''"
                                    :value="pendingReward"
                                    :class="{'h-has-opacity-40': ignoreReward && !pendingReward}"/>
            </div>
            <div class="is-flex is-justify-content-space-between mt-5">
              <div class="is-flex is-justify-content-flex-start">
                <button id="stopStakingButton" class="button is-white is-small"
                        :disabled="!stakedTo" @click="showStopConfirmDialog = true">STOP STAKING</button>
                <button id="showStakingDialog" class="button is-white is-small ml-4" @click="showStakingDialog = true">CHANGE STAKING</button>
              </div>
              <button id="disconnectWalletButton" class="button is-white is-small" @click="disconnectFromWallet">DISCONNECT {{ walletName.toLocaleUpperCase() }}</button>
            </div>
            <div class="mt-5 h-is-text-size-2 is-italic has-text-grey has-text-centered">
              <span class="has-text-grey-light">Please Note: </span>
              Your full balance is automatically staked.<br/>
              Your funds are fully available for use while staked.<br/>
              You can unstake or switch nodes freely.
            </div>
          </div>
          <div v-else>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :name="stakePeriodStart ? ('since ' + stakePeriodStart) : null"
                                    title="Staked to" :value="stakedTo"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :name="stakedAmount ? 'HBAR' : ''" title="My Stake" :value="stakedAmount"/>
              <div class="mt-4"/>

              <NetworkDashboardItem v-if="!ignoreReward && declineReward && !pendingReward"
                                    title="Rewards"
                                    value="Declined"/>
              <NetworkDashboardItem v-else
                                    title="Pending Reward"
                                    name="HBAR"
                                    :value="null"
                                    :class="{'h-has-opacity-40': ignoreReward && !pendingReward}"/>

              <div class="mt-4"/>
            </div>
              <div class="is-flex is-justify-content-center">
                  <button id="stopStakingButtonSmall" class="button is-white is-small"
                          :disabled="!stakedTo" @click="showStopConfirmDialog = true">STOP STAKING</button>
                  <button id="showStakingDialogSmall" class="button is-white is-small ml-4" @click="showStakingDialog = true">CHANGE STAKED TO</button>
                </div>
            <div class="is-flex is-justify-content-center mt-4">
              <button id="disconnectWalletButtonSmall" class="button is-white is-small" @click="disconnectFromWallet">DISCONNECT WALLET</button>
            </div>
            <div class="mt-5 h-is-text-size-2 is-italic has-text-grey has-text-centered">
              <span class="has-text-grey-light">Please Note: </span>
              Your full balance is automatically staked.<br/>
              Your funds are fully available for use while staked.<br/>
              You can unstake or switch nodes freely.
            </div>
            <div class="mt-4"/>
          </div>
        </template>

        <template v-else-if="connecting">
          <section class="section has-text-centered" style="min-height: 450px">
            <p>Connecting your Wallet...</p>
            <p>You need to select which account you wish to connect.</p>
            <br/>
            <button id="abortConnectWalletButton" class="button is-white is-small" @click="disconnectFromWallet">ABORT CONNECTION</button>
          </section>
        </template>

        <template v-else>
          <section class="section has-text-centered pt-0" :class="{'pb-0': isSmallScreen}">
            <p class="h-is-tertiary-text" style="font-weight: 300">
              To view or change your staking options first connect your wallet.
            </p>
            <br/>
            <button id="connectWalletButton" class="button is-white is-small" @click="chooseWallet">CONNECT WALLET…</button>
          </section>
        </template>

      </template>
    </DashboardCard>

    <DashboardCard v-if="accountId" :class="{'h-has-opacity-40': isIndirectStaking}">
      <template v-slot:title>
        <span class="h-is-secondary-title">Recent Staking Rewards</span>
      </template>
      <template v-slot:control>
        <DownloadButton @click="showDownloadDialog = true"/>
      </template>
      <template v-slot:content>
        <StakingRewardsTable
            :narrowed="true"
            :controller="transactionTableController"
        />
      </template>
    </DashboardCard>

    <RewardsCalculator :amount-in-hbar="balanceInHbar"
                       :node-id="stakedNode?.node_id"/>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import {useRouter} from "vue-router";
import Footer from "@/components/Footer.vue";
import {walletManager} from "@/router";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import axios from "axios";
import {Transaction, TransactionByIdResponse} from "@/schemas/HederaSchemas";
import {waitFor} from "@/utils/TimerUtils";
import StakingRewardsTable from "@/components/staking/StakingRewardsTable.vue";
import StakingDialog from "@/components/staking/StakingDialog.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import AccountLink from "@/components/values/AccountLink.vue";
import RewardsCalculator from "@/components/staking/RewardsCalculator.vue";
import WalletChooser from "@/components/staking/WalletChooser.vue";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {normalizeTransactionId} from "@/utils/TransactionID";
import {NodeCursor} from "@/components/node/NodeCursor";
import {AccountLoader} from "@/components/account/AccountLoader";
import {NodesLoader} from "@/components/node/NodesLoader";
import {StakingRewardsTableController} from "@/components/staking/StakingRewardsTableController";
import DownloadButton from "@/components/DownloadButton.vue";
import CSVDownloadDialog from "@/components/CSVDownloadDialog.vue";
import {RewardDownloader} from "@/utils/downloader/RewardDownloader";

export default defineComponent({
  name: 'Staking',

  props: {
    network: String,
    polling: { // For testing purpose
      type: Number,
      default: 3000 // Because a transaction emerges 3 or 4 seconds in mirror node after its completion in network
    }
  },

  components: {
    CSVDownloadDialog,
    DownloadButton,
    WalletChooser,
    RewardsCalculator,
    AccountLink,
    ConfirmDialog,
    ProgressDialog,
    DashboardCard,
    StakingDialog,
    StakingRewardsTable,
    NetworkDashboardItem,
    Footer,
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const router = useRouter()

    const showStakingDialog = ref(false)
    const showStopConfirmDialog = ref(false)
    const showWalletChooser = ref(false)
    const showErrorDialog = ref(false)
    const showProgressDialog = ref(false)
    const progressDialogMode = ref(Mode.Busy)
    const progressDialogTitle = ref<string|null>(null)
    const progressMainMessage = ref<string|null>(null)
    const progressExtraMessage = ref<string|null>(null)
    const progressExtraTransactionHash = ref<string|null>(null)
    const showProgressSpinner = ref(false)
    const showDownloadDialog = ref(false)

    const connecting = ref(false)

    const chooseWallet = () => {
      showWalletChooser.value = true
    }

    //
    // handleChooseWallet
    //
    const handleChooseWallet = (wallet: WalletDriver) => {
      walletManager.setActiveDriver(wallet)
      connecting.value = true
      walletManager
          .connect()
          .catch((reason) => {
            console.warn("Failed to connect wallet - reason:" + reason.toString())
            showProgressDialog.value = true
            progressDialogMode.value = Mode.Error
            progressDialogTitle.value = "Could not connect wallet"
            showProgressSpinner.value = false
            progressExtraTransactionHash.value = null

            if (reason instanceof WalletDriverError) {
              progressMainMessage.value = reason.message
              progressExtraMessage.value = reason.extra
            } else {
              progressMainMessage.value = "Unexpected error"
              progressExtraMessage.value = JSON.stringify(reason)
            }
          })
          .finally(() => connecting.value = false)
    }

    //
    // disconnectFromWallet
    //

    const disconnectFromWallet = () => {
      walletManager
          .disconnect()
          .finally(() => connecting.value = false)
    }

    //
    // Account
    //
    const accountLoader = new AccountLoader(walletManager.accountId)
    onMounted(() => accountLoader.requestLoad())

    const isStaked = computed(() => accountLoader.stakedNodeId.value !== null || accountLoader.stakedAccountId.value)
    const isIndirectStaking = computed(() => accountLoader.stakedAccountId.value)

    const stakedTo = computed(() => {
      let result: string|null
      if (accountLoader.stakedAccountId.value) {
        result = "Account " + accountLoader.stakedAccountId.value
      } else if (accountLoader.stakedNodeId.value !== null) {
        result = "Node " + accountLoader.stakedNodeId.value + " - " + stakedNodeLoader.shortNodeDescription.value
      } else {
        result = null
      }
      return result
    })

    const balanceInHbar = computed(() => {
      const balance = accountLoader.balance.value ?? 10000000000
      return balance / 100000000
    })

    const stakedAmount = computed(() => isStaked.value ? formatHbarAmount(accountLoader.balance.value) : null)

    const formatHbarAmount = (amount: number | null) => {
      let result
      if (amount) {
        const amountFormatter = new Intl.NumberFormat("en-US", {maximumFractionDigits: 8})
        result = amountFormatter.format(amount / 100000000)
      }
      else {
        result = null
      }
      return result
    }

    const pendingReward = computed(() => formatHbarAmount(accountLoader.pendingReward.value ?? null))
    const declineReward = computed(() => accountLoader.entity.value?.decline_reward ?? false)
    const ignoreReward = computed(() => accountLoader.stakedNodeId.value === null)

    //
    // stakedNode
    //

    const nodesLoader = new NodesLoader()
    onMounted(() => nodesLoader.requestLoad())
    const stakedNodeLoader = new NodeCursor(accountLoader.stakedNodeId, nodesLoader)

    //
    // handleStopStaking / handleChangeStaking
    //

    const handleStopStaking = () => {
      changeStaking(null, null, accountLoader.entity.value?.decline_reward ? false : null)
    }

    const handleChangeStaking = (nodeId: number|null, accountId: string|null, declineReward: boolean|null) => {
      changeStaking(nodeId, accountId, declineReward)
    }

    const changeStaking = async (nodeId: number|null, accountId: string|null, declineReward: boolean|null) => {

      try {

        showProgressDialog.value = true
        progressDialogMode.value = Mode.Busy
        progressDialogTitle.value = (nodeId == null && accountId == null && !declineReward) ? "Stopping staking" : "Updating staking"
        progressMainMessage.value = "Connecting to Hedera Network using your wallet…"
        progressExtraMessage.value = "Check your wallet for any approval request"
        progressExtraTransactionHash.value = null
        showProgressSpinner.value = false
        const transactionHash = normalizeTransactionId(await walletManager.changeStaking(nodeId, accountId, declineReward))
        progressMainMessage.value = "Completing operation…"
        progressExtraMessage.value = "This may take a few seconds"
        showProgressSpinner.value = true
        await waitForTransactionRefresh(transactionHash, 10)

        progressDialogMode.value = Mode.Success
        progressMainMessage.value = "Operation completed"
        showProgressSpinner.value = false
        progressExtraMessage.value = "with transaction ID:"
        progressExtraTransactionHash.value = transactionHash

      } catch(error) {

        progressDialogMode.value = Mode.Error
        if (error instanceof WalletDriverError) {
          progressMainMessage.value = error.message
          progressExtraMessage.value = error.extra
        } else {
          progressMainMessage.value = "Operation did not complete"
          progressExtraMessage.value = JSON.stringify(error.message)
        }
        progressExtraTransactionHash.value = null
        showProgressSpinner.value = false

      } finally {

        accountLoader.requestLoad()
      }

    }

    const waitForTransactionRefresh = async (transactionHash: string, attemptIndex: number) => {
      let result: Promise<Transaction | string>

      if (attemptIndex >= 0) {
        await waitFor(props.polling)
        try {
          const response = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + transactionHash )
          const transactions = response.data.transactions ?? []
          result = Promise.resolve(transactions.length >= 1 ? transactions[0] : transactionHash)
        } catch {
          result = waitForTransactionRefresh(transactionHash, attemptIndex - 1)
        }
      } else {
        result = Promise.resolve(transactionHash)
      }

      return result
    }

    //
    // Rewards Transactions Table Controller
    //
    const pageSize = computed(() => isMediumScreen ? 10 : 5)
    const transactionTableController = new StakingRewardsTableController(router, walletManager.accountId, pageSize)
    onMounted(() => transactionTableController.mount())
    onBeforeUnmount(() => transactionTableController.unmount())

    //
    // Rewards transaction downloader
    //
    const downloader = new RewardDownloader(
        walletManager.accountId,
        ref(null),
        ref(null),
        1000)

    return {
      isSmallScreen,
      isTouchDevice,
      connecting,
      connected: walletManager.connected,
      walletName: walletManager.walletName,
      walletIconURL: walletManager.getActiveDriver().iconURL,
      accountId: walletManager.accountId,
      accountChecksum: accountLoader.accountChecksum,
      account: accountLoader.entity,
      stakePeriodStart: accountLoader.stakePeriodStart,
      showStakingDialog,
      showStopConfirmDialog,
      showWalletChooser,
      showErrorDialog,
      showDownloadDialog,
      isIndirectStaking,
      stakedTo,
      stakedNode: stakedNodeLoader.node,
      balanceInHbar,
      stakedAmount,
      pendingReward,
      declineReward,
      ignoreReward,
      chooseWallet,
      handleChooseWallet,
      disconnectFromWallet,
      handleStopStaking,
      handleChangeStaking,
      showProgressDialog,
      progressDialogMode,
      progressDialogTitle,
      progressMainMessage,
      progressExtraMessage,
      progressExtraTransactionHash,
      showProgressSpinner,
      transactionTableController,
      downloader
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>