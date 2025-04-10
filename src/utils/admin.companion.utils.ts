import { registerCompanionBodyDto } from 'src/dto/auth.module.dto';

//  const location = userinfo.baselocations.map((l) => ({
//         city: l.city,
//         state: l.state,
//         googleformattedadress: l.formattedaddress,
//         googleloc: l.name,
//         userinput: l.userInput,
//         lat: l.lat,
//         lng: l.lng,
//         googleplaceextra: l.googleextra,
//       }));
//       const userdata = {
//         firstname: user.firstname,
//         lastname: user.lastname,
//         email: user.email,
//         gender: user.gender,
//         age: Number(user.age),
//         // isCompanion: true,
//         Images: user.Images,
//         phoneno: Number(user.phoneno),
//       };
//       const companion = {
//         bookingrate: Number(user?.bookingrate) || null,
//         bookingrateunit: CompanionBookingUnitEnum.PERHOUR,
//         description: user.description,
//         Skintone: user.skintone,
//         height: Number(user.height),
//         bodytype: user.bodytype,
//         eatinghabits: user.eatinghabits,
//         drinkinghabits: user.drinkinghabits,
//         smokinghabits: user.smokinghabits,
//       };
//       await this.prismaService.user.update({
//         where: { email: user.email },
//         data: {
//           ...userdata,
//           Companion: {
//             update: {
//               where: { userid: id },
//               data: {
//                 ...companion,
//                 baselocation: {
//                   updateMany: { where: { userid: id }, data: location },
//                 },
//               },
//             },
//           },
//         },
//       });

export const getupdateCompanionDetailrawQuey = (
  userinfo: registerCompanionBodyDto,
  user: registerCompanionBodyDto,
  baseids: number[],
) => {
  const location = userinfo.baselocations.map((l, i) => ({
    id: baseids[i],
    city: l.city,
    state: l.state,
    googleformattedadress: l.formattedaddress,
    googleloc: l.name,
    userinput: l.userInput,
    lat: l.lat,
    lng: l.lng,
    googleplaceextra: l.googleextra,
  }));

  let description = '';
  for (let i = 0; i < user.description.length; i += 1) {
    if (i < user.description.length - 1) {
      description += `'${user.description[i]}',`;
    }else{
        description += `'${user.description[i]}'`;
    }
  }
  let images = '';
  for (let i = 0; i < user.Images.length; i += 1) {
    if (i < user.Images.length - 1) {
      images += `'${user.Images[i]}',`;
    }else{
      images += `'${user.Images[i]}'`;
    }
  }
  // Prepare the raw SQL for locations using CASE WHEN for each column
  const setCityCase = location
    .map((l) => `WHEN id = ${l.id} THEN '${l.city}'`)
    .join(' ');

  const setStateCase = location
    .map((l) => `WHEN id = ${l.id} THEN '${l.state}'`)
    .join(' ');

  const setGoogleFormattedAddressCase = location
    .map((l) => `WHEN id = ${l.id} THEN '${l.googleformattedadress}'`)
    .join(' ');

  const setGoogleLocCase = location
    .map((l) => `WHEN id = ${l.id} THEN '${l.googleloc}'`)
    .join(' ');

  const setUserInputCase = location
    .map((l) => `WHEN id = ${l.id} THEN '${l.userinput}'`)
    .join(' ');

  const setLatCase = location
    .map((l) => `WHEN id = ${l.id} THEN ${l.lat}`)
    .join(' ');

  const setLngCase = location
    .map((l) => `WHEN id = ${l.id} THEN ${l.lng}`)
    .join(' ');

  const setGooglePlaceExtraCase = location
    .map((l) => `WHEN id = ${l.id} THEN '${JSON.stringify(l.googleplaceextra)}'`)
    .join(' ');
  
  const updateUserQuery = `
        -- Update User table
        UPDATE "User"
        SET
          firstname = '${user.firstname}',
          lastname = '${user.lastname}',
          email = '${user.email}',
          phoneno = ${user.phoneno},
          gender = '${user.gender}',
          "Images"=ARRAY[${images}],
          age = ${user.age}
        WHERE email = '${user.email}'`;
  const updateCompanionQuery = `
      
        -- Update Companion table
        UPDATE "Companion"
        SET
          bookingrate = ${Number(user?.bookingrate)},
          bookingrateunit = 'PERHOUR',
          description = ARRAY[${description}],
          "Skintone" = '${user.skintone}',
          height = ${user.height},
          bodytype = '${user.bodytype}',
          eatinghabits = '${user.eatinghabits}',
          drinkinghabits = '${user.drinkinghabits}',
          smokinghabits = '${user.smokinghabits}'
        WHERE userid = (SELECT id FROM "User" WHERE email = '${user.email}');`;
  const updateLocationquery = `
        -- Update Location table
        UPDATE "location"
        SET
          city = CASE ${setCityCase} ELSE city END,
          state = CASE ${setStateCase} ELSE state END,
          googleformattedadress = CASE ${setGoogleFormattedAddressCase} ELSE googleformattedadress END,
          googleloc = CASE ${setGoogleLocCase} ELSE googleloc END,
          userinput = CASE ${setUserInputCase} ELSE userinput END,
          lat = CASE ${setLatCase} ELSE lat END,
          lng = CASE ${setLngCase} ELSE lng END,
          googleplaceextra = CASE ${setGooglePlaceExtraCase} ELSE googleplaceextra END
        WHERE id IN (${location.map((l) => l.id).join(', ')});
      `;
  return { updateUserQuery, updateCompanionQuery, updateLocationquery };
};
