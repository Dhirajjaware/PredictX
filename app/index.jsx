import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

export default function App() {
  const [data, setData] = useState([]);
  const [prediction, setPrediction] = useState("");
  const [predictedColor, setPredictedColor] = useState("");
  const [nextIssue, setNextIssue] = useState("");
  const [timer, setTimer] = useState(60);

  const lastIssueRef = useRef(null);
  const lastPredictionRef = useRef({ size: "", color: "" });

  // Animation ref
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Countdown timer linked with fetch
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          fetchData(); // fetch only when timer resets
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // Animate when under 10s
  useEffect(() => {
    if (timer <= 10) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [timer]);

  const fetchData = async () => {
    try {
      const res = await fetch(
        "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts=" +
          Date.now(),
        { cache: "no-store" }
      );
      const json = await res.json();
      const newList = json.data.list || [];

      if (
        lastIssueRef.current &&
        newList.length > 0 &&
        newList[0].issueNumber !== lastIssueRef.current
      ) {
        Vibration.vibrate(200);
      }

      if (newList.length > 0) {
        lastIssueRef.current = newList[0].issueNumber;

        const { sizePrediction, colorPrediction } = predictNext(newList);
        setPrediction(sizePrediction);
        setPredictedColor(colorPrediction);

        const issueStr = newList[0].issueNumber.toString();
        const last3 = issueStr.slice(-3);
        const next = ((parseInt(last3) + 1) % 1000).toString().padStart(3, "0");
        setNextIssue(next);

        lastPredictionRef.current = {
          size: sizePrediction,
          color: colorPrediction,
        };
      }

      setData(newList);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const predictNext = (list) => {
    const lastNum = parseInt(list[0].number);
    const sizePrediction = lastNum >= 5 ? "Big" : "Small";
    const lastColor = list[0].color.split(",")[0];
    const colorPrediction = lastColor;
    return { sizePrediction, colorPrediction };
  };

  const renderItem = ({ item }) => {
    const num = parseInt(item.number);
    const pattern = num >= 5 ? "Big" : "Small";

    return (
      <View style={styles.rowCard}>
        <Text style={styles.periodCell}>{item.issueNumber}</Text>
        <Text style={[styles.bigCell, { color: num >= 5 ? "green" : "red" }]}>
          {item.number}
        </Text>
        <Text style={styles.bigCell}>{pattern}</Text>
        <Text
          style={[
            styles.bigCell,
            { color: item.color === "red" ? "red" : "green" },
          ]}
        >
          ●
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Transparent status bar */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.header}>
        <Text style={styles.headerText}>🏆 Win Go 1Min</Text>
      </View>

      {/* Prediction Box with Timer inside */}
      <View style={styles.predictionBox}>
        <Text style={styles.predictionTitle}>Next Prediction</Text>
        {nextIssue ? (
          <Text style={styles.nextIssue}>📌 Period: {nextIssue}</Text>
        ) : null}
        <Text
          style={[
            styles.predictionText,
            { color: prediction === "Big" ? "#e74c3c" : "#3498db" },
          ]}
        >
          {prediction}
        </Text>
        <Text style={styles.predictedColor}>
          🎨 Color:{" "}
          <Text style={{ color: predictedColor === "red" ? "red" : "green" }}>
            {predictedColor}
          </Text>
        </Text>

        {/* Animated Timer (moved inside) */}
        <Animated.Text
          style={[
            styles.timerText,
            {
              transform: [{ scale: scaleAnim }],
              color: timer <= 10 ? "red" : "#2ecc71",
            },
          ]}
        >
          ⏳ {timer}s
        </Animated.Text>
      </View>

      {/* Table Header */}
      <View style={[styles.rowCard, { backgroundColor: "#c0392b" }]}>
        <Text
          style={[styles.periodCell, { color: "#fff", fontWeight: "bold" }]}
        >
          Period
        </Text>
        <Text style={[styles.bigCell, { color: "#fff", fontWeight: "bold" }]}>
          Number
        </Text>
        <Text style={[styles.bigCell, { color: "#fff", fontWeight: "bold" }]}>
          Big Small
        </Text>
        <Text style={[styles.bigCell, { color: "#fff", fontWeight: "bold" }]}>
          Color
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.issueNumber}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e2f",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: "#f39c12",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
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
  nextIssue: {
    fontSize: 18,
    color: "#f1c40f",
    marginTop: 5,
    fontWeight: "bold",
  },
  predictionText: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },
  predictedColor: {
    fontSize: 18,
    marginTop: 8,
    color: "#ecf0f1",
  },
  timerText: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
  },
  /* ✅ Table Row Styles */
  rowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#444",
    backgroundColor: "#2d3436",
  },
  periodCell: {
    flex: 1.6,
    textAlign: "center",
    color: "#ecf0f1",
    fontSize: 12,
  },
  bigCell: {
    flex: 1,
    textAlign: "center",
    color: "#ecf0f1",
    fontSize: 18,
    fontWeight: "bold",
  },
});
