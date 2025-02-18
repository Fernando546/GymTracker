import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../../config/supabase';
import { useFocusEffect } from 'expo-router';
import React from 'react';

export default function WeightProgress() {
  const { user } = useAuth();
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [entries, setEntries] = useState<{ date: string; weight: number }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [startWeight, setStartWeight] = useState('');

  const loadWeights = React.useCallback(async () => {
    if (!user?.id) return;
    
    // Get weight goals
    const { data: goalsData } = await supabase
      .from('weight_goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (goalsData) {
      setTargetWeight(goalsData.target.toString());
      setStartWeight(goalsData.current.toString());
    }

    // Get weight entries
    const { data: entriesData } = await supabase
      .from('weight_entries')
      .select('date,weight')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (entriesData) {
      setEntries(entriesData.map(e => ({
        date: e.date,
        weight: Number(e.weight)
      })));
    }

    // Get latest weight
    const { data: latestData } = await supabase
      .from('weight_entries')
      .select('weight')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (latestData?.[0]?.weight) {
      setCurrentWeight(latestData[0].weight.toString());
    }
  }, [user?.id, setTargetWeight, setStartWeight, setEntries, setCurrentWeight]);

  useEffect(() => {
    loadWeights();
  }, [user?.id, loadWeights]);

  useFocusEffect(
    React.useCallback(() => {
      const channel = supabase
        .channel('weight-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'weight_entries',
          filter: `user_id=eq.${user?.id}`
        }, () => loadWeights())
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [user?.id, loadWeights])
  );

  const saveGoals = async () => {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('weight_goals')
      .upsert({
        user_id: user.id,
        current: Number(startWeight),
        target: Number(targetWeight)
      });

    if (error) {
      console.error('Save goals error:', error);
      return;
    }
    
    // Add initial weight entry if none exist
    if (entries.length === 0) {
      await supabase
        .from('weight_entries')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          weight: Number(startWeight)
        });
    }
  };

  const addTodayWeight = async () => {
    if (!user?.id || !currentWeight) return;
    
    const { error } = await supabase
      .from('weight_entries')
      .upsert(
        {
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          weight: Number(currentWeight)
        },
        { onConflict: 'user_id,date' }
      );

    if (error) {
      console.error('Add weight error:', error);
      return;
    }
    
    setShowForm(false);
  };

  const chartData = {
    labels: entries.map(e => new Date(e.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })),
    datasets: [
      // Main data line
      {
        data: entries.map(e => e.weight),
        color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`,
        strokeWidth: 2
      },
      // Start weight line
      {
        data: Array(entries.length).fill(Number(startWeight)),
        color: () => `rgba(124, 77, 255, 0.5)`,  
        strokeWidth: 2,
        withDots: false,
        dashed: true
      },
      // Target weight line
      {
        data: Array(entries.length).fill(Number(targetWeight)),
        color: () => `rgba(255, 204, 1, 0.5)`, 
        strokeWidth: 2,
        withDots: false,
        dashed: true
      }
    ],
    yAxisRange: [Math.min(Number(startWeight), Number(targetWeight)) - 2, Math.max(Number(startWeight), Number(targetWeight)) + 2]
  };

  const yMin = Math.min(Number(startWeight), Number(targetWeight)) - 2;
  const yMax = Math.max(Number(startWeight), Number(targetWeight)) + 2;

  console.log('Start Weight:', startWeight);
  console.log('Current Weight:', currentWeight);
  console.log('Target Weight:', targetWeight);
  console.log('Weight Entries:', entries);
  console.log('Chart Y-Axis Range:', [yMin, yMax]);

  return (
    <LinearGradient colors={['#080808', '#101010', '#181818']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color="#7C4DFF" 
            onPress={() => router.back()}
          />
          <Text style={styles.title}>Weight Progress</Text>
          <View style={{ width: 24 }} />
        </View>

        {(!currentWeight || !targetWeight || editMode) ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {currentWeight && targetWeight ? "Edit Goals" : "Set Your Goals"}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                label="Start Weight (kg)"
                value={startWeight}
                onChangeText={setStartWeight}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                theme={{ colors: { primary: '#7C4DFF' }}}
              />
              <TextInput
                label="Target Weight (kg)"
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                theme={{ colors: { primary: '#7C4DFF' }}}
              />
            </View>
            <Button 
              mode="contained" 
              onPress={() => {
                saveGoals();
                setEditMode(false);
              }}
              buttonColor="#7C4DFF"
              style={styles.button}
            >
              {currentWeight && targetWeight ? "Update Goals" : "Save Goals"}
            </Button>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.goalsHeader}>
              <Text style={styles.cardTitle}>Weight Goals</Text>
              <Button 
                mode="text" 
                onPress={() => setEditMode(true)}
                textColor="#7C4DFF"
              >
                Edit
              </Button>
            </View>
            <View style={styles.goalsContainer}>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Starting Weight</Text>
                <Text style={styles.goalValue}>{startWeight} kg</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Target Weight</Text>
                <Text style={styles.goalValue}>{targetWeight} kg</Text>
              </View>
            </View>
          </View>
        )}

        {/* Progress Chart */}
        {entries.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Progress Overview</Text>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 55}
              height={220}
              yAxisSuffix="kg"           
              fromZero={false}
              chartConfig={{
                backgroundColor: '#121212',
                backgroundGradientFrom: '#121212',
                backgroundGradientTo: '#121212',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '4', strokeWidth: '2', stroke: '#7C4DFF' }
              }}
              bezier
              style={{ 
                ...styles.chart,
                marginHorizontal: 0,
                alignSelf: 'stretch'
              }}
              withVerticalLines={false}
              withHorizontalLines={false}
              segments={5}
              // @ts-ignore - Library types are outdated
              yAxisRange={[yMin, yMax]}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              Add at least 2 weight entries to see progress
            </Text>
          </View>
        )}

        {/* Add Today's Weight */}
        <Button 
          mode="contained" 
          onPress={() => setShowForm(true)}
          buttonColor="#7C4DFF"
          style={styles.button}
        >
          Add Today's Weight
        </Button>
      </ScrollView>

      {/* Modal overlay */}
      {showForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextInput
                label="Today's Weight (kg)"
                value={currentWeight}
                onChangeText={setCurrentWeight}
                keyboardType="numeric"
                mode="outlined"
                style={styles.modalInput}
                theme={{ colors: { primary: '#7C4DFF' }}}
                autoFocus={true}
              />
              <View style={styles.modalButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowForm(false)}
                  style={styles.modalButton}
                  textColor="#7C4DFF"
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={addTodayWeight}
                  buttonColor="#7C4DFF"
                  style={styles.modalButton}
                >
                  Save
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  button: {
    borderRadius: 8,
    marginTop: 8,
  },
  chart: {
    borderRadius: 12,
    marginTop: 16,
    alignSelf: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 24,
  },
  modalContent: {
    width: '100%',
  },
  modalInput: {
    backgroundColor: '#1a1a1a',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  goalItem: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  goalLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  goalValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
}); 