import {

View,

Text,

} from 'react-native';

import { COLORS } from '../../utils/theme';

import type {
  Recall,
} from '../../types/recall';

interface Props{

recalls:Recall[];

}

export default function RecallPreview({

recalls,

}:Props){

if(!recalls.length){

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
No active recalls.
</Text>

</View>

);

}

return(

<>

{recalls.map(item=>(

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

{item.recallNumber}

</Text>

<Text>

{item.reason}

</Text>

</View>

))}

</>

);

}