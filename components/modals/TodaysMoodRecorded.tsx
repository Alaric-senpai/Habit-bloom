import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, ScrollView } from 'react-native';
import storage from '@/lib/storage/mmkv'

import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

const { height } = Dimensions.get('window');

export default function TodaysMoodRecorded() {

    const userid = storage.getItem('activeUserID')

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);


    if(!userid) return

  return (
        <>
          <Button
            onPress={handlePresentModalPress}
            title="Present Modal"
            color="black"
          />
          <BottomSheetModal
            ref={bottomSheetModalRef}
            onChange={handleSheetChanges}
            snapPoints={['50%', '80%']}
          >
            <BottomSheetView style={styles.contentContainer}>
              <Text style={styles.title}>Today's Mood Recorded! 🎉</Text>
              
              <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Mood Summary</Text>
                  <Text style={styles.text}>Great job tracking your mood today!</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Activities</Text>
                  <Text style={styles.text}>• Morning meditation completed</Text>
                  <Text style={styles.text}>• Workout session finished</Text>
                  <Text style={styles.text}>• Healthy breakfast logged</Text>
                  <Text style={styles.text}>• Reading time recorded</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Insights</Text>
                  <Text style={styles.text}>You're maintaining great consistency with your habits. Keep up the excellent work!</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tomorrow's Goals</Text>
                  <Text style={styles.text}>• Continue morning routine</Text>
                  <Text style={styles.text}>• Try a new healthy recipe</Text>
                  <Text style={styles.text}>• Take a walk outside</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Motivational Quote</Text>
                  <Text style={styles.quote}>"Success is the sum of small efforts repeated day in and day out."</Text>
                  <Text style={styles.quoteAuthor}>- Robert Collier</Text>
                </View>

                <View style={styles.buttonContainer}>
                  <Button title="Close" onPress={() => bottomSheetModalRef.current?.dismiss()} />
                </View>
              </ScrollView>
            </BottomSheetView>
        </BottomSheetModal>
        </>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
    zIndex: 50
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  scrollContent: {
    flex: 1,
    width: '100%',
  },
  section: {
    marginBottom: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 4,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});