// import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

export default function App() {
  const [data, setData] = useState([]);
  const [prediction, setPrediction] = useState("");
  const lastIssueRef = useRef(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(
        "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts=" +
          Date.now()
      );
      const json = await res.json();
      const newList = json.data.list || [];

      if (
        lastIssueRef.current &&
        newList.length > 0 &&
        newList[0].issueNumber !== lastIssueRef.current
      ) {
        playSound();
        Vibration.vibrate(200); // small vibration on new result
      }

      if (newList.length > 0) {
        lastIssueRef.current = newList[0].issueNumber;
        setPrediction(predictNext(newList));
      }

      setData(newList);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/notify.mp3") // add your sound file in assets
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Sound error:", error);
    }
  };

  const predictNext = (list) => {
    // simple strategy: last number >= 5 → predict "Small", else "Big"
    const lastNum = parseInt(list[0].number);
    return lastNum >= 5 ? "Small" : "Big";
  };

  const renderItem = ({ item }) => {
    const num = parseInt(item.number);
    const pattern = num >= 5 ? "Big" : "Small";

    return (
      <View style={styles.card}>
        <Text style={styles.issue}>Issue: {item.issueNumber}</Text>
        <Text style={styles.num}>🎲 Number: {item.number}</Text>
        <Text style={styles.color}>🎨 Color: {item.color}</Text>
        <Text
          style={[
            styles.pattern,
            { color: pattern === "Big" ? "#e74c3c" : "#3498db" },
          ]}
        >
          🔮 Pattern: {pattern}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.predictionBox}>
        <Text style={styles.predictionTitle}>Next Prediction</Text>
        <Text
          style={[
            styles.predictionText,
            { color: prediction === "Big" ? "#e74c3c" : "#3498db" },
          ]}
        >
          {prediction}
        </Text>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.issueNumber}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e2f",
    padding: 10,
  },
  predictionBox: {
    backgroundColor: "#2c3e50",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ecf0f1",
  },
  predictionText: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },
  card: {
    backgroundColor: "#2d3436",
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 3,
  },
  issue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f1c40f",
  },
  num: {
    fontSize: 16,
    color: "#ecf0f1",
    marginTop: 4,
  },
  color: {
    fontSize: 14,
    color: "#bdc3c7",
  },
  pattern: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 6,
  },
});
