import {

View,

Text,

} from 'react-native';

import { COLORS } from '../../utils/theme';
import type {
  Transfer,
} from '../../types/transfer';

interface Props{

transfers:Transfer[];

}

export default function TransferPreview({

transfers,

}:Props){

if(!transfers.length){

return(

<View

style={{

backgroundColor:COLORS.white,

padding:18,

borderRadius:18,

}}

>

<Text
  style={{
    color: COLORS.subtitle,
    textAlign: 'center',
  }}
>
No recent transfers.
</Text>

</View>

);

}

return(

<>

{transfers.map(item=>(

<View

key={item.id}

style={{

backgroundColor:COLORS.white,

padding:18,

borderRadius:18,

marginBottom:12,

}}

>

<Text

style={{

fontWeight:'700',

}}

>

{item.batch.batchNumber}

</Text>

<Text
  style={{
    color: COLORS.subtitle,
    marginTop: 4,
  }}
>
Quantity: {item.quantity}
</Text>

</View>

))}

</>

);

}