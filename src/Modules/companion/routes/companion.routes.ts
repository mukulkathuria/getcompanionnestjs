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

export const CompanionAnalysisInnerRoutes =  {
    baseUrl: CompanionRoute + '/analysis',
    companionoverallanalysis: 'companionoverallanalysis',
    companionanalysisdetails: 'companionanalysisdetails',
    companionanalysisdetailsbyid: 'companionanalysisdetailsbyid',
    companionearningsanalysis: 'companionearningsanalysis',
    companionratingsanalysis: 'companionratingsanalysis',
    getallcompanioncompletedearnings: 'getallcompanioncompletedearnings',
    getallcompanionpendingearnings: 'getallcompanionpendingearnings'
}

export const CompanionSettingInnerRoutes =  {
    baseUrl: CompanionRoute + '/setting',
    companionavailableslot: 'companionavailableslot',
    companionupdateslot: 'companionupdateslot',
    companionupdatesetting: 'companionupdatesetting',
    companiongetsetting: 'companiongetsetting',
}