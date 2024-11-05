import {
  CompanionDescriptionEnum,
  UpdateCompanionProfileBodyDto,
  UpdateUserProfileBodyDto,
  UserCompanionProfileDto,
  UserlocationProfileDto,
} from 'src/dto/user.dto';

export const isvalidUserinputs = (userinfo: UpdateUserProfileBodyDto) => {
  const results = {};
  const validsusers = ['firstname', 'lastname', 'gender'];
  for (let i = 0; i < validsusers.length; i += 1) {
    if (userinfo[validsusers[i]] && userinfo[validsusers[i]].trim().length) {
      results[validsusers[i]] = userinfo[validsusers[i]];
    } else if (
      userinfo[validsusers[i]] &&
      !userinfo[validsusers[i]].trim().length
    ) {
      return {
        error: { status: 422, message: `${validsusers[i]} is not valid` },
      };
    }
  }
  if (
    userinfo['age'] &&
    userinfo['age'].trim().length &&
    Number(userinfo['age']) > 18
  ) {
    results['age'] = Number(userinfo['age']);
  }
  const location = ['zipcode', 'lat', 'lng', 'city'];
  const locationvalue: UserlocationProfileDto = {};
  for (let i = 0; i < location.length; i += 1) {
    if (userinfo[location[i]] && userinfo[location[i]].trim().length) {
      if (location[i] !== 'city' && !isNaN(Number(userinfo[location[i]]))) {
        locationvalue[location[i]] = Number(userinfo[location[i]]);
      } else if (
        location[i] !== 'city' &&
        isNaN(Number(userinfo[location[i]]))
      ) {
        return {
          error: { status: 422, message: `${location[i]} is not valid` },
        };
      }
      locationvalue[location[i]] = userinfo[location[i]];
    } else if (userinfo[location[i]] && !userinfo[location[i]].trim().length) {
      return {
        error: { status: 422, message: `${location[i]} is not valid` },
      };
    }
  }
  return { userdata: results, locationdata: locationvalue };
};

export const isvalidComanioninputs = (
  userinfo: UpdateCompanionProfileBodyDto,
) => {
  const results = {};
  let descriptionDetails: CompanionDescriptionEnum[] | null = null;
  try {
    if (userinfo.description) {
      const tempdesc = JSON.parse(userinfo.description as any);
      descriptionDetails = Array.isArray(tempdesc)
        ? tempdesc.map((l) => l.trim())
        : [];
    }
    // eslint-disable-next-line
  } catch (error) {
    return { error: { status: 422, message: 'Invalid Description' } };
  }
  const validsusers = ['firstname', 'lastname', 'gender'];
  for (let i = 0; i < validsusers.length; i += 1) {
    if (userinfo[validsusers[i]] && userinfo[validsusers[i]].trim().length) {
      results[validsusers[i]] = userinfo[validsusers[i]];
    } else if (
      userinfo[validsusers[i]] &&
      !userinfo[validsusers[i]].trim().length
    ) {
      return {
        error: { status: 422, message: `${validsusers[i]} is not valid` },
      };
    }
  }
  if (
    userinfo['age'] &&
    userinfo['age'].trim().length &&
    Number(userinfo['age']) > 18
  ) {
    results['age'] = Number(userinfo['age']);
  }
  const location = ['zipcode', 'lat', 'lng', 'city'];
  const locationvalue: UserlocationProfileDto = {};
  for (let i = 0; i < location.length; i += 1) {
    if (userinfo[location[i]] && userinfo[location[i]].trim().length) {
      if (location[i] !== 'city' && !isNaN(Number(userinfo[location[i]]))) {
        locationvalue[location[i]] = Number(userinfo[location[i]]);
      } else if (
        location[i] !== 'city' &&
        isNaN(Number(userinfo[location[i]]))
      ) {
        return {
          error: { status: 422, message: `${location[i]} is not valid` },
        };
      }
      locationvalue[location[i]] = userinfo[location[i]];
    } else if (userinfo[location[i]] && !userinfo[location[i]].trim().length) {
      return {
        error: { status: 422, message: `${location[i]} is not valid` },
      };
    }
  }

  const companionvalues = ['bookingrate', 'height', 'skintone' , 'bodytype'];
  const companion: UserCompanionProfileDto = {};
  for (let i = 0; i < companionvalues.length; i += 1) {
    if (
      userinfo[companionvalues[i]] &&
      userinfo[companionvalues[i]].trim().length
    ) {
      if ((companionvalues[i] !== 'skintone' || companionvalues[i] !== 'bodytype') && !isNaN(Number(userinfo[companionvalues[i]]))) {
        companion[companionvalues[i]] = Number(userinfo[companionvalues[i]]);
      } else if (
        (companionvalues[i] !== 'skintone' || companionvalues[i] !== 'bodytype')&&
        isNaN(Number(userinfo[companionvalues[i]]))
      ) {
        return {
          error: { status: 422, message: `${companionvalues[i]} is not valid` },
        };
      }
      companion[companionvalues[i]] = userinfo[companionvalues[i]];
    } else if (
      userinfo[companionvalues[i]] &&
      !userinfo[companionvalues[i]].trim().length
    ) {
      return {
        error: { status: 422, message: `${companionvalues[i]} is not valid` },
      };
    }
  }
  if (
    descriptionDetails.length &&
    descriptionDetails.every((l) => CompanionDescriptionEnum[l])
  ) {
    companion['description'] = descriptionDetails;
  }
  return {
    userdata: results,
    locationdata: locationvalue,
    companiondata: companion,
  };
};
