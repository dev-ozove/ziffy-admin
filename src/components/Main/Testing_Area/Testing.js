import React, { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import MainPrediction from './Main_prediction';
import IPLScreen from './IPL_screen';
import Fantasy from './Fantasy';
import TabPanel from './TabPanel';

export default function Testing() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabStyle = {
    marginTop:65,
    borderBottom: '2px solid #1976d2',
  };

  const tabLabelStyle = {
    fontWeight: 'bold',
    margin: '0 20px',
  };

  return (
    <>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        style={tabStyle}
      >
        <Tab label="IPL Screen" style={tabLabelStyle} />
        <Tab label="Fantasy" style={tabLabelStyle} />
        <Tab label="Main Prediction" style={tabLabelStyle} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <IPLScreen />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Fantasy />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <MainPrediction />
      </TabPanel>
    </>
  );
}
