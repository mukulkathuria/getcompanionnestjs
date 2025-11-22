import { registerCompanionBodyDto } from 'src/dto/auth.module.dto';
import { PaymentType } from 'src/dto/userpaymentmethod.dto';

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
  paymentmethodids: string[],
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
    } else {
      description += `'${user.description[i]}'`;
    }
  }
  let images = '';
  for (let i = 0; i < user.Images.length; i += 1) {
    if (i < user.Images.length - 1) {
      images += `'${user.Images[i]}',`;
    } else {
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
    .map(
      (l) => `WHEN id = ${l.id} THEN '${JSON.stringify(l.googleplaceextra)}'`,
    )
    .join(' ');

  const paymentTypeCase = userinfo.paymentmethods
    .map((l, i) => `WHEN id = '${paymentmethodids[i]}' THEN '${l.type}'`)
    .join(' ');

  const ifscCase = userinfo.paymentmethods
    .map(
      (l, i) =>
        `WHEN id = '${paymentmethodids[i]}' THEN ${l.type === PaymentType.BANK_ACCOUNT ? `'${l.ifscCode}'` : null}`,
    )
    .join(' ');
  const upiIdCase = userinfo.paymentmethods
    .map(
      (l, i) =>
        `WHEN id = '${paymentmethodids[i]}' THEN ${l.type === PaymentType.UPI ? `'${l.upiId}'` : null}`,
    )
    .join(' ');
  const walletDetailsCase = userinfo.paymentmethods
    .map(
      (l, i) =>
        `WHEN id = '${paymentmethodids[i]}' THEN ${l.type === PaymentType.WALLET ? `'${l.walletIdentifier}'` : null}`,
    )
    .join(' ');
  const accountNumberCase = userinfo.paymentmethods
    .map(
      (l, i) =>
        `WHEN id = '${paymentmethodids[i]}' THEN ${l.type === PaymentType.BANK_ACCOUNT ? l.accountNumber : null}`,
    )
    .join(' ');
  const accountHolderNameCase = userinfo.paymentmethods
    .map(
      (l, i) =>
        `WHEN id = '${paymentmethodids[i]}' THEN ${l.type === PaymentType.BANK_ACCOUNT ? `'${l.accountHolderName}'` : null}`,
    )
    .join(' ');
  const recipientNameCase = userinfo.paymentmethods
    .map(
      (l, i) => `WHEN id = '${paymentmethodids[i]}' THEN '${l.recipientName}'`,
    )
    .join(' ');
  const nicknameCase = userinfo.paymentmethods
    .map(
      (l, i) => `WHEN id = '${paymentmethodids[i]}' THEN '${l.nickname || null}'`,
    )
    .join(' ');
  const upiProviderCase = userinfo.paymentmethods
    .map(
      (l, i) =>
        `WHEN id = '${paymentmethodids[i]}' THEN ${l.type === PaymentType.UPI ? `'${l.upiProvider}'` || null : null}`,
    )
    .join(' ');
  const walletProviderCase = userinfo.paymentmethods
    .map(
      (l, i) =>
        `WHEN id = '${paymentmethodids[i]}' THEN ${l.type === PaymentType.WALLET ? `'${l.walletProvider}'` : null}`,
    )
    .join(' ');
  const bankNameCase = userinfo.paymentmethods
    .map(
      (l, i) =>
        `WHEN id = '${paymentmethodids[i]}' THEN ${l.type === PaymentType.BANK_ACCOUNT ? `'${l.bankName}'` : null}`,
    )
    .join(' ');
  const accountTypeCase = userinfo.paymentmethods
    .map(
      (l, i) =>
        `WHEN id = '${paymentmethodids[i]}' THEN ${l.type === PaymentType.BANK_ACCOUNT ? `'${l.accountType}'` : null}`,
    )
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
  const updatePaymentMethodquery = `
        -- Update Payment Methods table
        UPDATE "userpaymentmethods"
        SET
          type = CASE ${paymentTypeCase} ELSE type END,
          "recipientName" = CASE ${recipientNameCase} ELSE "recipientName" END,
          nickname = CASE ${nicknameCase} ELSE nickname END,
          "ifscCode" = CASE ${ifscCase} ELSE "ifscCode" END,
          "upiId" = CASE ${upiIdCase} ELSE "upiId" END,
          "walletIdentifier" = CASE ${walletDetailsCase} ELSE "walletIdentifier" END,
          "accountNumber" = CASE ${accountNumberCase} ELSE "accountNumber" END,
          "accountHolderName" = CASE ${accountHolderNameCase} ELSE "accountHolderName" END,
          "upiProvider" = CASE ${upiProviderCase} ELSE "upiProvider" END,
          "walletProvider" = CASE ${walletProviderCase} ELSE "walletProvider" END,
          "bankName" = CASE ${bankNameCase} ELSE "bankName" END,
          "accountType" = CASE ${accountTypeCase} ELSE "accountType" END
        WHERE id IN (${paymentmethodids.map((l) => `'${l}'`).join(', ')});
      `;
  return { updateUserQuery, updateCompanionQuery, updateLocationquery, updatePaymentMethodquery };
};
