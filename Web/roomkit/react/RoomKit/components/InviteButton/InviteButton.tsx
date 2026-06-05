import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dropdown,
  IconInvite,
  IconShare,
  TUIButton,
  TUIDialog,
  Toast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import { useContactListState } from 'tuikit-atomicx-react/chat';
import {
  RoomParticipantStatus,
  UserPicker,
  useLoginState,
  useRoomParticipantState,
  useRoomState,
} from 'tuikit-atomicx-react/room';
import { conference as conferenceImpl } from '../../adapter/conference';
import { IconButton } from '../base/IconButton';
import styles from './InviteButton.module.scss';
import { RoomShare } from './RoomShare';
import type { IConference } from '../../adapter/type';
import type {
  IUserPickerDataSource,
  IUserPickerRef,
  IUserPickerResult,
  IUserPickerRow,
  RoomUser,
} from 'tuikit-atomicx-react/room';

const conference = conferenceImpl as unknown as IConference;

interface ContactRow {
  userID: string;
  nick: string;
  avatar: string;
}

export function InviteButton() {
  const { t } = useUIKit();
  const { loginUserInfo } = useLoginState();
  const { currentRoom, callUserToRoom } = useRoomState();
  const { participantList, pendingParticipantList } = useRoomParticipantState();
  const { friendList: defaultFriendList } = useContactListState();

  const [userPickerVisible, setUserPickerVisible] = useState(false);
  const [roomShareVisible, setRoomShareVisible] = useState(false);
  const [customContactList, setCustomContactList] = useState<RoomUser[]>([]);

  const userPickerRef = useRef<IUserPickerRef<ContactRow>>(null);

  // Mirror Vue `computed(() => conference.getFeatureConfig('contactList'))`.
  // Recomputed on each render because the adapter is not yet reactive — cheap
  // identity check, the async fetch downstream is gated on actual reference
  // change.
  const contactListProvider = conference.getFeatureConfig('contactList');

  // Mirror Vue `watch(contactListProvider, async (provider) => { ... }, { immediate: true })`.
  // Load the custom contact list when the provider is configured; clear it
  // otherwise. `cancelled` guards against the provider reference flipping
  // mid-fetch.
  useEffect(() => {
    if (!contactListProvider) {
      setCustomContactList([]);
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const list = await contactListProvider();
        if (!cancelled) {
          setCustomContactList(list);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load custom contact list:', error);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [contactListProvider]);

  const friendList = useMemo<ContactRow[]>(() => {
    if (contactListProvider) {
      return customContactList.map(item => ({
        userID: item.userId,
        nick: item.userName || '',
        avatar: item.avatarUrl || '',
      }));
    }
    return (defaultFriendList || []).map(item => ({
      userID: item.userID,
      nick: item.nick || '',
      avatar: item.avatar || '',
    }));
  }, [contactListProvider, customContactList, defaultFriendList]);

  // Filter friends already in the room or currently being called.
  const userPickerData = useMemo<IUserPickerDataSource<ContactRow>>(
    () => friendList
      .filter(item => !participantList.some(p => p.userId === item.userID))
      .filter(item => !pendingParticipantList.some(
        u => u.userId === item.userID && u.roomStatus === RoomParticipantStatus.InCalling,
      ))
      .map<IUserPickerRow<ContactRow>>(item => ({
        key: item.userID,
        label: item.nick,
        avatarUrl: item.avatar,
        extraData: item,
      })),
    [friendList, participantList, pendingParticipantList],
  );

  const handleOpenUserPicker = () => setUserPickerVisible(true);
  const handleOpenRoomShare = () => setRoomShareVisible(true);

  const handleUserPickerConfirm = async () => {
    try {
      const selected: IUserPickerResult<ContactRow>
        = userPickerRef.current?.getSelectedItems() || [];
      if (selected.length === 0) {
        Toast.error({ message: t('Invite.PleaseSelectUser') });
        return;
      }
      await callUserToRoom({
        roomId: currentRoom?.roomId || '',
        userIdList: selected.map(item => item.key),
        timeout: 60,
      });
      setUserPickerVisible(false);
      Toast.success({ message: t('Invite.InviteSuccess') });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to invite users to room:', error);
      Toast.error({ message: t('Invite.InviteFailed') });
    }
  };

  const dropdownContent = (
    <div className={styles.operateList}>
      <div className={styles.operateItem} onClick={handleOpenUserPicker}>
        <IconInvite size="18" />
        <span className={styles.operateItemText}>{t('Invite.AddMember')}</span>
      </div>
      <div className={styles.operateItem} onClick={handleOpenRoomShare}>
        <IconShare size="18" />
        <span className={styles.operateItemText}>{t('Invite.ShareRoom')}</span>
      </div>
    </div>
  );

  return (
    <div className={styles.inviteButton}>
      <Dropdown
        trigger="click"
        placement="top"
        teleported={false}
        dropdownContent={dropdownContent}
      >
        <IconButton title={t('Invite.Title')}>
          <IconInvite size="24" />
        </IconButton>
      </Dropdown>

      <TUIDialog
        visible={userPickerVisible}
        title={`${t('Contacts')} (${userPickerData.length})`}
        appendTo="#roomPage"
        showConfirm={false}
        showCancel={false}
        onClose={() => setUserPickerVisible(false)}
      >
        {userPickerVisible && (
          <>
            <div className={styles.roomUserPicker}>
              <UserPicker
                ref={userPickerRef}
                dataSource={userPickerData}
                displayMode="list"
              />
            </div>
            <div className={styles.userPickerFooter}>
              <TUIButton onClick={() => setUserPickerVisible(false)}>
                {t('Room.Cancel')}
              </TUIButton>
              <TUIButton type="primary" onClick={handleUserPickerConfirm}>
                {t('Room.Confirm')}
              </TUIButton>
            </div>
          </>
        )}
      </TUIDialog>

      <TUIDialog
        visible={roomShareVisible}
        title={t('Room.InviteToMeeting', {
          userName: loginUserInfo?.userName || loginUserInfo?.userId,
        })}
        appendTo="#roomPage"
        customClasses={[styles.roomShareDialog]}
        showConfirm={false}
        showCancel={false}
        onClose={() => setRoomShareVisible(false)}
      >
        <RoomShare roomInfo={currentRoom} />
      </TUIDialog>
    </div>
  );
}
