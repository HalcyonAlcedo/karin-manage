<script setup lang="ts">
// imported components
import TotalEarning from './components/TotalEarning.vue';
import TotalOrder from './components/TotalOrder.vue';
import TotalIncome from './components/TotalIncome.vue';
import TotalGrowth from './components/TotalGrowth.vue';
import PopularStocks from './components/PopularStocks.vue';
import BotList from './components/BotList.vue';
import PluginCount from './components/PluginCount.vue';
import RendererCount from './components/RendererCount.vue';
import ManageUserCount from './components/ManageUserCount.vue';
import MessageCount from './components/MessageCount.vue';
</script>

<template>
  <v-row>
    <!-- -------------------------------------------------------------------- -->
    <!-- Total Earning -->
    <!-- -------------------------------------------------------------------- -->

    <!-- -------------------------------------------------------------------- -->
    <!-- Total Order -->
    <!-- -------------------------------------------------------------------- -->

    <!-- -------------------------------------------------------------------- -->
    <!-- Total Income -->
    <!-- -------------------------------------------------------------------- -->


    <!-- -------------------------------------------------------------------- -->
    <!-- Total Growth -->
    <!-- -------------------------------------------------------------------- -->


    <!-- -------------------------------------------------------------------- -->
    <!-- Popular Stocks -->
    <!-- -------------------------------------------------------------------- -->

    <!-- 插件数量 -->
    <v-col cols="12" lg="4">
      <PluginCount />
    </v-col>
    <!-- 渲染器数量 -->
    <v-col cols="12" lg="4">
      <RendererCount />
    </v-col>
    <!-- 面板用户数量 -->
    <v-col cols="12" lg="4">
      <ManageUserCount />
    </v-col>
    <!-- 统计信息 -->
    <v-col cols="12" lg="7">
      <MessageCount />
    </v-col>
    <!-- 机器人列表 -->
    <v-col cols="12" lg="5">
      <BotList />
    </v-col>
  </v-row>
</template>
