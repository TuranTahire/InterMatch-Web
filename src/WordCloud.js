import React from 'react';

const WordCloud = ({ words, title }) => {
  // Kelime frekanslarını hesapla
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // En sık kullanılan kelimeleri al ve boyutları hesapla
  const sortedWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20) // En fazla 20 kelime
    .map(([word, freq], index) => ({
      text: word,
      value: freq,
      size: Math.max(12, Math.min(32, 12 + (freq * 2))) // 12-32px arası
    }));

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">{title}</h3>
      <div className="flex flex-wrap justify-center gap-2 min-h-[200px] items-center">
        {sortedWords.map((word, index) => (
          <span
            key={index}
            className="inline-block px-2 py-1 rounded-full font-medium transition-all duration-300 hover:scale-110 cursor-pointer"
            style={{
              fontSize: `${word.size}px`,
              backgroundColor: colors[index % colors.length] + '20',
              color: colors[index % colors.length],
              border: `1px solid ${colors[index % colors.length]}40`
            }}
            title={`${word.text}: ${word.value} kez kullanıldı`}
          >
            {word.text}
          </span>
        ))}
      </div>
      <div className="text-xs text-gray-500 text-center mt-2">
        Kelime boyutu kullanım sıklığını gösterir
      </div>
    </div>
  );
};

export default WordCloud; 