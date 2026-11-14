import {

View,

Text,

TouchableOpacity,

} from 'react-native';
import StatusChip from '../common/StatusChip';
import {

MaterialIcons,

} from '@expo/vector-icons';
import React from 'react';
import {

COLORS,

} from '../../utils/theme';

import type {

InventoryBatch,

} from '../../types/inventory';

interface Props{

item:InventoryBatch;
role?: string;
onPress():void;

}

function InventoryCard({

item,
role,
onPress,

}:Props){

const batch=item.batch;
const expiry = new Date(batch.expiryDate);

const today = new Date();

const daysRemaining = Math.ceil(
  (expiry.getTime() - today.getTime()) /
    (1000 * 60 * 60 * 24)
);
return(

<TouchableOpacity

onPress={onPress}

style={{

backgroundColor:COLORS.white,

padding:18,

borderRadius:18,

marginBottom:16,

elevation:3,

}}

>

<View

style={{

flexDirection:'row',

justifyContent:'space-between',

alignItems:'center',

}}

>

<Text

style={{

fontWeight:'700',

fontSize:18,

}}

>

{batch.drugName}

</Text>

<MaterialIcons

name="inventory"

size={26}

color={COLORS.information}

/>

</View>

<Text
  style={{
    marginTop: 10,
    color: COLORS.subtitle,
    fontSize: 13,
  }}
>
Batch Number
</Text>

<Text
  style={{
    fontWeight: '700',
    marginTop: 4,
  }}
>
{batch.batchNumber}
</Text>

<Text
  style={{
    marginTop: 8,
    color: COLORS.subtitle,
    fontSize: 13,
  }}
>
Quantity
</Text>

<Text
  style={{
    fontWeight: '700',
    marginTop: 4,
  }}
>
{item.quantity.toLocaleString()} Units
</Text>
{(role === 'SUPER_ADMIN' ||
  role === 'REGULATOR') &&
  item.owner && (
    <>
      <Text
        style={{
          marginTop: 10,
          color: COLORS.subtitle,
          fontSize: 13,
        }}
      >
        Owner
      </Text>

      <Text
        style={{
          fontWeight: '700',
          marginTop: 4,
        }}
      >
        {item.owner.fullName} ({item.owner.role})
      </Text>
    </>
)}
<View
  style={{
    marginTop: 8,
  }}
>
  <StatusChip status={batch.status} />
</View>

<Text
  style={{
    marginTop: 10,
  }}
>
🗓 {new Date(
  batch.expiryDate,
).toLocaleDateString()}
</Text>
{daysRemaining <= 30 &&
 batch.status === 'ACTIVE' && (
  <Text
    style={{
      color: COLORS.warning,
      fontWeight: '700',
      marginTop: 8,
    }}
  >
    ⚠ Expires in {daysRemaining} days
  </Text>
)}
</TouchableOpacity>

);

}
export default React.memo(InventoryCard);