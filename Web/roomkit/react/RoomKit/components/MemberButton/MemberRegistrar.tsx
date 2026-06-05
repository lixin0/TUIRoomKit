import { useEffect } from 'react';
import { useUIKit } from '@tencentcloud/uikit-base-component-react';
import { RoomParticipantList } from 'tuikit-atomicx-react/room';
import { BuiltinWidget } from '../../adapter/type';
import { useRoomSidePanel } from '../../hooks/useRoomSidePanel';
import { MemberButton } from './MemberButton';

/**
 * Registration-only component: mounts the member list panel into the side
 * panel store. Mirrors Vue `MemberRegistrar.vue` (empty template, register on
 * mount). Renders the trigger button alongside.
 */
export function MemberRegistrar() {
  const { t } = useUIKit();
  const { registerSidePanel } = useRoomSidePanel();

  useEffect(
    () => registerSidePanel({
      id: BuiltinWidget.MemberWidget,
      title: () => t('Participant.Title'),
      render: () => <RoomParticipantList />,
    }),
    [registerSidePanel, t],
  );

  return <MemberButton />;
}
