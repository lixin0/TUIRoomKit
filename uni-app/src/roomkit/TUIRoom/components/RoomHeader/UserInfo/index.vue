<template>
  <div ref="userInfoRef" class="user-info-container">
    <div @tap="handleUserControl" class="user-info-content">
      <Avatar class="avatar" :img-src="avatarUrl"></Avatar>
      <div class="name">{{ userName || userId }}</div>
    </div>

    <div v-if="showUserControl" class="user-control-container">
      <div class="logout-mobile">
        <div class="logout-mobile-main">
          <div class="logout" @tap="() => $emit('log-out')">
            <i> {{ t('Log out') }}</i>
          </div>
          <div class="close" @click.stop="showUserControl = false">
            <i>{{ t('Cancel') }}</i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import useUserInfo from './useUserInfoHooks';
const {
  userInfoRef,
  showUserControl,
  t,
  handleUserControl,
} = useUserInfo();
interface Props {
  userId: string,
  userName: string,
  avatarUrl?: string,
}
defineProps<Props>();
defineEmits(['log-out']);
</script>
<style lang="scss" scoped>
.user-info-container {
  position: relative;
  .user-info-content {
    display: flex;
    align-items: center;
    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
    }
    .name {
      margin-left: 20px;
      font-size: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #000000;
    }
    .down-icon {
      margin-left: 4px;
    }
  }
  .user-control-container {
    background: #E8E8E8;
    box-shadow: 0 12px 32px rgba(0, 0, 0, .1), 0 2px 6px;
    color: #000000;
    padding: 10px 0;
    position: absolute;
    top: calc(100% + 14px);
    right: 0;
    border-radius: 4px;
    .user-control-item-foot,.user-control-item-head{
      width: 104px;
      text-align: center;
      font-size: 14px;
      height: 20px;
    }
  }
  .logout-mobile{
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 100vw;
      z-index: 9;
      background:  rgba(0, 0, 0, 0.7);
      &-main{
        position: absolute;
        bottom: 34px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    .logout{
      width: 90%;
      background: #F9F9F9C7;
      border-radius: 14px;
      padding: 1rem 0;
      display: flex;
      justify-content: center;
      align-items: center;
      i {
        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 400;
        font-size: 20px;
        line-height: 24px;
        text-align: center;
        color: #FF2E2E;
      }
    }
    .close {
      width: 90%;
      border-radius: 14px;
      padding: 1em 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #FFFFFF;
      margin-top: 0.625rem;
      i{
        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 400;
        font-size: 20px;
        line-height: 24px;
        text-align: center;
        color: #007AFF;
      }
    }
  }
}
</style>
