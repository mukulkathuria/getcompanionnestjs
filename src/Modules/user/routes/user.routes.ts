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
  googleregister: 'google-register'
};

export const UserprofileInnerRoute = { 
    deleteuser: 'delete',
    updateprofile: 'updateprofile/:id',
    usertocompaniondetails: 'usercompaniondetails'
}

export const UserBookingInnerRoute = {
  upcomingbooking: 'upcomingbooking',
  previousbookings: 'prevousbookgs',
  bookacompanion: 'bookacompanion',
  checkcompanionslot: 'checkcompanionslot',
  cancelbooking: 'cancelbooking'
}

export const UserSessionInnerRoute = {
  startsession: 'startsession',
  endsession: 'endsession',
  extendsession: 'extendsession'
}

export const UsernotificationInnerRoute = {
  getusernotifications: 'usernotification'
}
