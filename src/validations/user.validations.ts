import { UpdateUserProfileBodyDto } from 'src/dto/user.dto';

export const isvalidUserinputs = (userinfo: UpdateUserProfileBodyDto) => {
  let results = {};
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
  if (userinfo['age'] && typeof userinfo['age'] === 'number' && userinfo['age'] > 18) {
    results['age'] = userinfo['age'];
  }
  const location = ['zipcode', 'lat', 'lng'];
  let locationvalue = {};
  if (userinfo['city'] && userinfo['city'].trim().length) {
    locationvalue['city'] = userinfo['city'];
  }
  for (let i = 0; i < location.length; i += 1) {
    if (userinfo[location[i]] && typeof userinfo[location[i]] === 'number') {
      locationvalue[location[i]] = userinfo[location[i]];
    } else if (
      userinfo[location[i]] &&
      typeof userinfo[location[i]] !== 'number'
    ) {
      return {
        error: { status: 422, message: `${location[i]} is not valid` },
      };
    }
  }
  //   if (Object.values(locationvalue).length) {
  //     results = { ...results, location: { connectOrCreate: locationvalue } };
  //   }
  return { userdata: results, locationdata: locationvalue };
};
