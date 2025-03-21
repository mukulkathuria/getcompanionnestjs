export const AdminRoute = '/admin';
export const AdminUserDelete = AdminRoute + '/delete';
export const AdminUserProfileRoute = AdminRoute + '/profile';
export const AdminUserBookingsRoute = AdminRoute + '/booking';
export const AdminUserTransactionsRoute = AdminRoute + '/transactions';
export const AdminUserCompanionFindRoute = AdminRoute + '/companionfind';
export const AdminUserChatRoomRoute = '/userchatrooms';
export const AdminAcceptanceRoute = AdminRoute + '/accept'
export const AdminIssuesRoute = AdminRoute + '/issues';
export const AdminNotificaionRoute = AdminRoute + '/notification';
export const AdminAccountsRoute = AdminRoute + '/accounts';

export const AdminBookingInnerRoutes = {
    bookingrequestroute: 'bookingrequest',
    bookingdetailsroute: 'bookingdetails',
    getallbookinglistroute: 'getallbookinglist',
    getcancelledbookinglistroute: 'getcancelledbookinglist',
    getunderextensionbookinglistroute: 'getunderextensionbookinglist',
    getcancelledbookinglistofuserroute: 'getcancelledbookinglistofuser'
}

export const AdminIssuesInnerRoutes = {
    getAllActiveIssuesRoute: 'getallactiveissues',
    createNewIssueRoute: 'createnewissue',
    getIssueDetailsRoute: 'getissuedetails',
    addcommentonIssueRoute: 'addcommentonissue',
    updateissuestatusRoute: 'updateissuestatus'
}

export const AdminNotificaionInnerRoute = {
    getallnotifications: 'getnotification'
}

export const AdminCompanionInnerRoutes = {
    registercompanionroute: 'registercompanion',
    updatecompanionprofileroute: 'updatecompanionprofile/:id',
    getupdatecompaniondetailsroute: 'getupdatecompaniondetails',
    getcompanionupdaterequestlistroute: 'getcompanionupdaterequestlist',
    updatecompaniondetailsroute: 'updatecompaniondetails/:id',
    updateCompanionRequestStatusRoute: 'updatecompanionrequeststatus',
    getlompanionlistbylocationRoute: 'getcompanionlistbylocation',
    getcompaniondetailsforupdaterateRoute: 'getcompaniondetailsforupdaterate',
    getnewcompanionrequestlistRoute: 'getnewcompanionrequestlist',
    getnewcompanionrequestdetailsRoute: 'getnewcompanionrequestdetails',
    updatecompanionbasepriceRoute: 'updatecompanionbaseprice/:id',
    updatebecompanionrequeststatusRoute: 'updatebecompanionrequeststatus'  
}

export const AdminAcceptanceInnerRoute = {
    updatecancellationstatusroute: 'updatecancellationstatus',
    rejectbookingsroute: 'rejectbookings'
}

export const AdminAccountsInnerRoute = {
    getaccountstatementRoute: 'getaccountstatement' 
}