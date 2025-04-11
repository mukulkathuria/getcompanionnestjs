import { clear } from 'node:console';

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
export const UserExtensionRoute = UserRoute + '/extension';

export const UserAuthInnerRoute = {
  base: 'auth',
  login: 'login',
  register: 'register',
  logout: 'logout',
  refreshtoken: 'refreshtoken',
  forgotpassword: 'forgot-password',
  googlelogin: 'google-login',
  googleregister: 'google-register',
  resetpassword: 'reset-password',
  validateemailotp: 'validateemailotp'
};

export const UserprofileInnerRoute = {
  deleteuser: 'delete',
  updateprofile: 'updateprofile/:id',
  usertocompaniondetails: 'usercompaniondetails',
  userProfileDetails: 'userprofiledetails',
  getcompanionfulldetails: 'getcompanionfulldetails',
  updatecompanionrequest: 'updatecompanionrequest/:id',
  getuserotherdetailsroute: 'getuserotherdetails'
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
  getAverageRating: 'getaveragerating',
  getupcomingbookingforcompanion: 'getupcomingbookingforcompanion',
  getupcomingbookingforuser: 'getupcomingbookingforuser',
  getpreviousbookingforcompanion: 'getpreviousbookingforcompanion',
  getlivelocationofbookingRoute: 'getlivelocationofbooking',
  updatelivelocationofbookingRoute: 'updatelivelocationofbooking/:id',
};

export const UserSessionInnerRoute = {
  startsession: 'startsession',
  endsession: 'endsession',
  extendsession: 'extendsession',
  startextendsession: 'startextendsession',
};

export const UsernotificationInnerRoute = {
  getusernotifications: 'usernotification',
  clearnotifications: 'clearnotifications',
};

export const UserTransactionInnerRoute = {
  gethashfortransaction: 'gethashfortransaction',
  initiatepayment: 'initiatepayment',
  onsuccesspayment: 'onsuccesspayment',
  onfailurepayment: 'onfaliurepaymnt',
  onsuccesspaymentofextension: 'onsuccesspaymentofextension',
  onfailurepaymentofextension: 'onfaliurepaymntofextension',
};

export const ChatRoomInnerRoutes = {
  getAllChatRoomRoute: 'getallchats',
  getChatMessageHistoryRoute: 'getchathistory',
};

export const UserIssuesInnerRoutes = {
  getAllActiveIssuesRoute: 'getallactiveissues',
  createNewIssueRoute: 'createnewissue',
  getIssueDetailsRoute: 'getissuedetails',
  addcommentonIssueRoute: 'addcommentonissue',
};

export const UserExtensionInnerRoute = {
  getextensiondetails: 'getextensiondetails',
  updaterecordextension: 'updaterecordextension',
  updatebeforeextension: 'updatebeforeextension',
};
