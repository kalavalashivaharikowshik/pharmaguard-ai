import {

View,

Text,

} from 'react-native';

interface Props{

count:number;

}

export default function AlertBanner({

count,

}:Props){

if(count===0){

return null;

}

return(

<View

style={{

backgroundColor:'#FEF3C7',

borderRadius:16,

padding:18,

marginBottom:20,

}}

>

<Text

style={{

fontWeight:'700',

fontSize:16,

}}

>

⚠ Attention Required

</Text>

<Text

style={{

marginTop:6,

color:'#92400E',

}}

>

You currently have

{` ${count} `}

active recalls requiring review.

</Text>

</View>

);

}