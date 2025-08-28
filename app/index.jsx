import React, { useEffect, useRef, useState } from "react";
import {
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

  const lastIssueRef = useRef(null);
  const lastPredictionRef = useRef({ size: "", color: "" });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

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
    const sizePrediction = lastNum >= 5 ? "Small" : "Big";
    const lastColor = list[0].color.split(",")[0];
    const colorPrediction = lastColor;
    return { sizePrediction, colorPrediction };
  };

  const renderItem = ({ item }) => {
    const num = parseInt(item.number);
    const pattern = num >= 5 ? "Big" : "Small";

    return (
      <View style={styles.card}>
        <Text style={styles.issue}>Period: {item.issueNumber}</Text>
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
    <View style={styles.container}>
      {/* Make the status bar fully transparent */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.header}>
        <Text style={styles.headerText}>🏆 Win Go 1Min</Text>
      </View>

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
      </View>

      {/* ✅ Added Plans Section */}
      <View style={styles.plansContainer}>
        <Text style={styles.plansTitle}>💎 Choose Your Plan</Text>

        <View style={styles.planCard}>
          <Text style={styles.planName}>Weekly Plan</Text>
          <Text style={styles.planPrice}>₹100 / week</Text>
        </View>

        <View style={styles.planCard}>
          <Text style={styles.planName}>Monthly Plan</Text>
          <Text style={styles.planPrice}>₹300 / month</Text>
        </View>

        <View style={styles.planCard}>
          <Text style={styles.planName}>Yearly Plan</Text>
          <Text style={styles.planPrice}>₹2000 / year</Text>
        </View>
      </View>

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
  /* ✅ Plans Styles */
  plansContainer: {
    backgroundColor: "#2c3e50",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f1c40f",
    marginBottom: 10,
  },
  planCard: {
    backgroundColor: "#34495e",
    width: "90%",
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ecf0f1",
  },
  planPrice: {
    fontSize: 16,
    color: "#1abc9c",
    marginTop: 4,
  },
  /* ✅ List Card Styles */
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
