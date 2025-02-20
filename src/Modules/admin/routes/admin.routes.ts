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

export const AdminBookingInnerRoutes = {
    bookingrequestroute: 'bookingrequest',
    bookingdetailsroute: 'bookingdetails',
    getallbookinglistroute: 'getallbookinglist',
    getcancelledbookinglistroute: 'getcancelledbookinglist',
    getunderextensionbookinglistroute: 'getunderextensionbookinglist',
}

export const AdminIssuesInnerRoutes = {
    getAllActiveIssuesRoute: 'getallactiveissues',
    createNewIssueRoute: 'createnewissue',
    getIssueDetailsRoute: 'getissuedetails',
    addcommentonIssueRoute: 'addcommentonissue'
}

export const AdminNotificaionInnerRoute = {
    getallnotifications: 'getnotification'
}

export const AdminCompanionInnerRoutes = {
    registercompanionroute: 'registercompanion',
    updatecompanionprofileroute: 'updatecompanionprofile/:id',
    getupdatecompaniondetailsroute: 'getupdatecompaniondetails',
    getcompanionupdaterequestlistroute: 'getcompanionupdaterequestlist',
}