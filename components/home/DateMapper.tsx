import { View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { GRADIENTS, THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Text } from '../ui/text';

interface centeredDate {
    label:string;
    isToday:boolean;
    date:number
}

function getCenteredDates():centeredDate[] {
  const today = new Date();
  const result = [];

  for (let i = -2; i <= 2; i++) {
    const current = new Date();
    current.setDate(today.getDate() + i);

    result.push({
      label: current.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue...
      isToday: i === 0,
      date: current.getDate()
    });
  }

  return result;
}

const DateMapper = () => {

    const [dates, setDates] = useState<centeredDate[]>([])

    useEffect(()=>{
        setDates(getCenteredDates())

    }, [])

  return (
    <View className='my-2 mt-3 flex-row items-center justify0-between'>
        {dates.map((date, idx)=>(
            <CenteredDateComponent key={idx} date={date.date} label={date.label} isToday={date.isToday} />
        ))}
    </View>
  )
}

export default DateMapper


const CenteredDateComponent = ({label, isToday, date}:centeredDate)=>{
    return (
        <View className='w-1/5 items-center justify-center flex-col gap-1'>
            <Text className={cn(isToday ? 'text-primary': 'text-secondary', 'font-semibold text-center')}>
                {label.toUpperCase()}
            </Text>
            <View style={{
                width: 60,
                height: 60,
                overflow: 'hidden',
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
                backgroundColor: isToday? GRADIENTS.primaryCyan.start : GRADIENTS.darkTeal.middle
            }}>
                <Text className='text-white'>
                    {date}
                </Text>
            </View>

        </View>
    )
}