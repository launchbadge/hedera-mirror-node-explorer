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

  <div id="node-table">
    <o-table
        :data="nodes"
        :hoverable="true"
        :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
        :paginated="false"
        :striped="true"
        default-sort="node_id"
        @click="handleClick"
    >
      <o-table-column v-slot="props" field="node_id" label="Node">
        <div class="is-numeric regular-node-column">
          {{ props.row.node_id }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="node_account_id" label="Account">
        <div class="is-numeric regular-node-column">
          {{ props.row.node_account_id }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="description" label="Description">
        <div class="should-wrap regular-node-column">
          <BlobValue v-bind:blob-value="makeDescription(props.row)" v-bind:show-none="true"/>
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="stake" label="Stake" position="right">
        <o-tooltip :label="tooltipStake"
                   multiline
                   :delay="tooltipDelay"
                   class="h-tooltip">
          <span class="regular-node-column">
            <HbarAmount :amount="makeUnclampedStake(props.row)" :decimals="0"/>
            <span v-if="props.row.stake" class="ml-1">{{ '(' + makeWeightPercentage(props.row) + ')' }}</span>
            <span v-else class="ml-1 has-text-grey">(&lt;Min)</span>
          </span>
        </o-tooltip>
      </o-table-column>

       <o-table-column v-slot="props" field="stake_not_rewarded" label="Stake Not Rewarded" position="right">
         <o-tooltip :label="tooltipNotRewarded"
                    multiline
                    :delay="tooltipDelay"
                    class="h-tooltip">
           <span class="regular-node-column">
             <HbarAmount :amount="props.row.stake_not_rewarded ?? 0" :decimals="0"/>
          </span>
         </o-tooltip>
       </o-table-column>

      <o-table-column v-slot="props" field="last_reward_rate" label="Last Reward Rate" position="right">
        <o-tooltip :label="tooltipRewardRate"
                   multiline
                   :delay="tooltipDelay"
                   class="h-tooltip">
          <span class="regular-node-column">
            {{ makeApproxYearlyRate(props.row) }}
          </span>
        </o-tooltip>
      </o-table-column>

      <o-table-column id="stake-range-column" v-slot="props" field="stake-range" label="Stake Range" style="  padding-bottom: 2px; padding-top: 12px;">
        <StakeRange :node="props.row"/>
      </o-table-column>

    </o-table>
  </div>

  <EmptyTable v-if="!nodes.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType} from 'vue';
import {NetworkNode} from "@/schemas/HederaSchemas";
import BlobValue from "@/components/values/BlobValue.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StakeRange from "@/components/node/StakeRange.vue";
import {routeManager} from "@/router";


//
// defineComponent
//

export default defineComponent({
  name: 'NodeTable',

  components: {StakeRange, HbarAmount, EmptyTable, BlobValue},

  props: {
    nodes: Object as PropType<Array<NetworkNode> | undefined>,
    unclampedStakeTotal: Number,
    stakeTotal: Number,
  },

  setup(props) {
    const tooltipDelay = 500
    const tooltipStake = "This is the total amount staked to this node, followed by its consensus weight " +
        "(weight is absent when the amount staked is below minimum)."
    const tooltipNotRewarded = "This is the total amount staked to this node by accounts that have chosen " +
        "to decline rewards (and all accounts staked to those accounts)."
    const tooltipRewardRate = "This is an approximate annual reward rate based on the reward earned during the " +
        "last 24h period."

    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const makeDescription = (node: NetworkNode) => {
      let result
      if (node.description) {
        result = node.description
      } else if (node.node_account_id) {
        result = operatorRegistry.makeDescription(node.node_account_id)
      } else {
        result = null
      }
      return result
    }
    const makeUnclampedStake = (node: NetworkNode) => (node.stake_rewarded ?? 0) + (node.stake_not_rewarded ?? 0)
    const makeWeightPercentage = (node: NetworkNode) => {
      const formatter = new Intl.NumberFormat("en-US", {
        style: 'percent',
        maximumFractionDigits: 1
      })
      return formatter.format(node.stake && props.stakeTotal ? node.stake / props.stakeTotal : 0);
    }

    const rewardRate = (node: NetworkNode) => {
      return (node.reward_rate_start ?? 0) / 100000000
    }
    const makeApproxYearlyRate = (node: NetworkNode) => {
      const formatter = new Intl.NumberFormat("en-US", {
        style: 'percent',
        maximumFractionDigits: 2
      })
      return formatter.format(rewardRate(node) * 365);
    }

    const handleClick = (node: NetworkNode) => {
      routeManager.routeToNode(node.node_id ?? 0)
    }

    return {
      tooltipDelay,
      tooltipStake,
      tooltipNotRewarded,
      tooltipRewardRate,
      isTouchDevice,
      isMediumScreen,
      makeDescription,
      makeUnclampedStake,
      makeWeightPercentage,
      makeApproxYearlyRate,
      handleClick,
      ORUGA_MOBILE_BREAKPOINT,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

#node-table table.o-table > tbody > tr > td {
  padding-top: 0;
  padding-bottom: 0;
}
.regular-node-column {
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>
