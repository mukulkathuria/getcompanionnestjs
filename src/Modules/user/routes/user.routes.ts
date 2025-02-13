export const UserRoute = '/user';
export const UserLocationRoute = UserRoute + '/location';
export const UserDelete = UserRoute + '/delete';
export const UserProfileRoute = UserRoute + '/profile';
export const UserBookingsRoute = UserRoute + '/booking';
export const UserTransactionsRoute = UserRoute + '/transactions';
export const UserCompanionFindRoute = UserRoute + '/companionfind';
export const UserSessionRoute = UserRoute + '/session';
export const UserChatRoomRoute = UserRoute + '/chatrooms';
export const UserNotificationRoute = UserRoute + '/notifications';
export const UserIssuesRoute = UserRoute + '/issues';

export const UserAuthInnerRoute = {
  base: 'auth',
  login: 'login',
  register: 'register',
  logout: 'logout',
  refreshtoken: 'refreshtoken',
  forgotpassword: 'forgot-password',
  googlelogin: 'google-login',
  googleregister: 'google-register',
};

export const UserprofileInnerRoute = {
  deleteuser: 'delete',
  updateprofile: 'updateprofile/:id',
  usertocompaniondetails: 'usercompaniondetails',
  userProfileDetails: 'userprofiledetails',
};

export const UserBookingInnerRoute = {
  upcomingbooking: 'upcomingbooking',
  previousbookings: 'previousbookings',
  bookacompanion: 'bookacompanion',
  checkcompanionslot: 'checkcompanionslot',
  cancelbooking: 'cancelbooking',
  getBookingDetailsforUser: 'userbookingdetails',
  rateabookingRoute: 'rateabookingRoute',
  getBookingDetailsforall: 'getBookingDetailsforall',
  getAverageRating: 'getaveragerating'
};

export const UserSessionInnerRoute = {
  startsession: 'startsession',
  endsession: 'endsession',
  extendsession: 'extendsession',
};

export const UsernotificationInnerRoute = {
  getusernotifications: 'usernotification',
};

export const UserTransactionInnerRoute = {
  gethashfortransaction: 'gethashfortransaction',
  initiatepayment: 'initiatepayment',
  onsuccesspayment: 'onsuccesspayment',
  onfailurepayment: 'onfaliurepaymnt',
};

export const ChatRoomInnerRoutes = {
  getAllChatRoomRoute: 'getallchats',
  getChatMessageHistoryRoute: 'getchathistory',
};

export const UserIssuesInnerRoutes = {
  getAllActiveIssuesRoute: 'getallactiveissues',
  createNewIssueRoute: 'createnewissue',
  getIssueDetailsRoute: 'getissuedetails',
  addcommentonIssueRoute: 'addcommentonissue'
};
