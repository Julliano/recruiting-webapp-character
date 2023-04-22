import { useState, useMemo, useCallback, useEffect } from 'react';

import './App.css';
import { ATTRIBUTE_LIST_ENUM, ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts.js';

const defaultAttValue = 10;
const attributeInitialState = ATTRIBUTE_LIST.reduce((acc, curr) => (acc[curr] = defaultAttValue, acc), {})
const skillInitialState = SKILL_LIST.reduce((acc, curr) => (acc[curr.name] = 0, acc), {})

function App() {
  const [attributeValues, setAttributeValues] = useState(attributeInitialState);
  const [skillValues, setSkillValues] = useState(skillInitialState);
  const [currentSkillLeft, setCurrentSkillLeft] = useState(0);
  const [classSelected, setClassSelected] = useState(null);

  const calculateModifier = useCallback((value) => {
    const defaultValue = value - defaultAttValue;

    return Math.floor(defaultValue / 2);
  }, []);

  const totalSkillPoints = useCallback(() => {
    return 10 + (calculateModifier(attributeValues[ATTRIBUTE_LIST_ENUM.Intelligence]) * 4);
  }, [attributeValues, calculateModifier]);

  const handleSetAttributeValue = useCallback((operation, attribute) => {
    if (operation === 'add') {
      setAttributeValues({ ...attributeValues, [attribute]: attributeValues[attribute] + 1 })
    } else {
      if (attributeValues[attribute] > 0) {
        setAttributeValues({ ...attributeValues, [attribute]: attributeValues[attribute] - 1 })
      }
    }
  }, [attributeValues, setAttributeValues]);

  const handleSetSkillValue = useCallback((operation, skill) => {
    const skillLimitReached = currentSkillLeft <= 0;

    if (operation === 'add') {
      if (skillLimitReached) {
        return alert(`You used your limit of ${totalSkillPoints()} points. Upgrade intelligence to get more`);
      }
      setSkillValues({ ...skillValues, [skill]: skillValues[skill] + 1 })
    } else {
      if (skillValues[skill] > 0) {
        setSkillValues({ ...skillValues, [skill]: skillValues[skill] - 1 })
      }
    }
  }, [skillValues, currentSkillLeft, setSkillValues, totalSkillPoints]);

  const attributeBlock = useMemo(() => {
    return ATTRIBUTE_LIST.map((attribute, index) => (
      <div key={`${attribute}-${index}`} className='App-character-attribute-item'>
        {attribute}: {attributeValues[attribute]} (Modifier: {calculateModifier(attributeValues[attribute])})
        <button
          className='App-character-attribute-item-button'
          onClick={() => handleSetAttributeValue('add', attribute)
          }>
          +
        </button>
        <button
          className='App-character-attribute-item-button'
          onClick={() => handleSetAttributeValue('sub', attribute)}
        >
          -
        </button>
      </div>
    ))
  }, [attributeValues, handleSetAttributeValue, calculateModifier]);

  const meetsRequirements = useCallback((key) => {
    const classRequirements = CLASS_LIST[key];
    let meetRequirements = true;

    for (const key in classRequirements) {
      meetRequirements = meetRequirements && attributeValues[key] >= classRequirements[key];
    }

    return meetRequirements;
  }, [attributeValues]);

  const classesBlock = useMemo(() => {
    const classBlock = [];

    for (const key in CLASS_LIST) {
      classBlock.push(
        <div
          key={key}
          className={`App-character-class-item ${meetsRequirements(key) ? 'App-character-class-item__active' : ''}`}
          onClick={() => setClassSelected(key)}
        >
          <p>{key}</p>
        </div>
      );
    }
    return classBlock;
  }, [meetsRequirements, setClassSelected]);

  const classSelectedBlock = useCallback(() => {
    return (
      <>
        {Object.entries(CLASS_LIST[classSelected]).map(([key, value]) => (
          <div key={key} className='App-character-attribute-item'>
            {key}: {value}
          </div>
        ))}
        <button onClick={() => setClassSelected(null)}> Close requirements view </button>
      </>
    )
  }, [classSelected, setClassSelected]);

  const totalSkillValue = useCallback((value, attributeModifier) => {
    return value + attributeModifier;
  }, []);

  const skillBlock = useCallback(() => {
    return SKILL_LIST.map(({ name, attributeModifier }) => (
      <div key={name} className='App-character-skill-item'>
        {name}: {skillValues[name]} (Modifier: {attributeModifier}): {calculateModifier(attributeValues[attributeModifier])}
        <button
          className='App-character-skill-item-button'
          onClick={() => handleSetSkillValue('add', name)}
        >
          +
        </button>
        <button
          className='App-character-skill-item-button'
          onClick={() => handleSetSkillValue('sub', name)}
        >
          -
        </button>
        Total: {totalSkillValue(skillValues[name], calculateModifier(attributeValues[attributeModifier]))}
      </div>
    ))
  }, [attributeValues, skillValues, totalSkillValue, handleSetSkillValue, calculateModifier]);

  useEffect(() => {
    const currentSkillSum = Object.values(skillValues).reduce((a, b) => a + b, 0);
    const newSkillSum = totalSkillPoints() - currentSkillSum;
    if (newSkillSum < 0) {
      // If attributes points are smaller than current skill points.
      // reset skill points so they are not negative
      setSkillValues(skillInitialState);
    }
    setCurrentSkillLeft(newSkillSum);
  }, [skillValues, attributeValues, totalSkillPoints]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        <div className='App-section-character'>
          <div className='App-section-character-attributes'>
            <h2>Attributes</h2>
            {attributeBlock}
          </div>
          <div className='App-section-character-classes'>
            <h2>Classes</h2>
            {classesBlock}
          </div>
          {classSelected && (
            <div className='App-section-character-classes-selected'>
              <h2>{classSelected} Minimum Requirements</h2>
              {classSelectedBlock()}
            </div>
          )}
          <div className='App-section-character-skills'>
            <h2>Skills</h2>
            <h4>
              Total skill points: {totalSkillPoints()}
            </h4>
            <h4>
              Points left: {currentSkillLeft}
            </h4>
            {skillBlock()}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
