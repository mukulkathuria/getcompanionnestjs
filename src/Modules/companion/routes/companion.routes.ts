export const CompanionRoute = '/companion';


export const CompanionRequestInnerRoutes = {
    baseUrl: CompanionRoute + '/request',
    requestforcompanion: 'requestforcompanion',
    registeracompanion: 'registerforcompanion'
}

export const CompanionBookingInnerRoutes =  {
    baseUrl: CompanionRoute + '/booking',
    companionbookingdetails: 'companionbookingdetails',
    companionacceptbooking: 'companionacceptbooking',
    companionrejectbooking: 'companionrejectbooking'
}