import { useState, useCallback } from "react";
import PrefectureList from "./components/PrefectureList";
import PopulationChart from "./components/PopulationChart";
import type { PopulationResponse, Prefecture } from "./types/api";
import "./App.css";

function App() {
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set());
  const [populationData, setPopulationData] = useState<Map<number, PopulationResponse>>(new Map());
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);

  const handlePrefecturesChange = useCallback((newPrefectures: Prefecture[]) => {
    setPrefectures(newPrefectures);
  }, []);

  const handleSelectionChange = useCallback((newSelection: Set<number>) => {
    setSelectedPrefs(newSelection);
  }, []);

  const handleDataChange = useCallback((newData: Map<number, PopulationResponse>) => {
    setPopulationData(newData);
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>都道府県別人口推移グラフ</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        <div>
          <PrefectureList 
            onPrefecturesChange={handlePrefecturesChange}
            onSelectionChange={handleSelectionChange}
            onDataChange={handleDataChange}
          />
        </div>
        
        <div>
          <PopulationChart 
            data={populationData}
            selectedPrefs={selectedPrefs}
            prefectures={prefectures}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
