import React, { memo } from "react";
import ReactWordcloud from "react-wordcloud";

const WordCloudChart = ({ classCount, onWordClick }) => {
    if (!classCount) return null;

    return (
        <ReactWordcloud
            words={Object.keys(classCount).map((clCount) => ({
                text: clCount,
                value: classCount[clCount],
            }))}
            options={{
                fontSizes: [14, 40],
                fontFamily: ["Arial"],
                rotations: 2,
                rotationAngles: [0, 0],
            }}
            callbacks={{
                onWordClick: onWordClick,
            }}
        />
    );
};

export default memo(WordCloudChart);
