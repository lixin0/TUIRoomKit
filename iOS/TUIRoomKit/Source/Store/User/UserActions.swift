//
//  UserActions.swift
//  TUIRoomKit
//
//  Created by CY zhao on 2024/6/5.
//

import RTCRoomEngine

enum UserActions {
    static let key = "action.user"
    static let getSelfInfo = ActionTemplate(id: key.appending(".getSelfInfo"))
    static let updateSelfInfo = ActionTemplate(id: key.appending(".updateSelfInfo"), payloadType: UserInfo.self)
    static let fetchUserInfo = ActionTemplate(id: key.appending(".fetchUserInfo"), payloadType: String.self)
    static let updateAllUsers = ActionTemplate(id: key.appending(".updateAllUsers"), payloadType: [UserInfo].self)
    static let updateHasScreenStreamUsers = ActionTemplate(id: key.appending(".updateHasScreenStreamUsers"), payloadType: Set<String>.self)
    static let updateDisableMessageUsers = ActionTemplate(id: key.appending(".updateDisableMessageUsers"), payloadType: Set<String>.self)
}
