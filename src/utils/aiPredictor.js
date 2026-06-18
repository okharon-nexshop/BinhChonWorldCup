// AI Predictor Utility for World Cup 2026

export const teamData = {
  "Mexico": { rank: 15, strength: 78, form: "W-D-L-W-D", players: "Santiago Giménez, Edson Álvarez", history: "Vào vòng 16 đội 7 lần liên tiếp (1994-2018)" },
  "Nam Phi": { rank: 59, strength: 65, form: "D-W-L-D-W", players: "Percy Tau, Teboho Mokoena", history: "Vòng bảng World Cup 1998, 2002, 2010" },
  "Hàn Quốc": { rank: 22, strength: 75, form: "W-W-D-L-W", players: "Son Heung-min, Kim Min-jae", history: "Hạng 4 World Cup 2002, Vòng 16 đội 2022" },
  "Cộng hòa Séc": { rank: 36, strength: 72, form: "D-W-D-L-W", players: "Patrik Schick, Tomáš Souček", history: "Á quân World Cup 1934, 1962 (dưới danh nghĩa Tiệp Khắc)" },
  "Canada": { rank: 40, strength: 70, form: "L-W-D-W-L", players: "Alphonso Davies, Jonathan David", history: "Tham dự World Cup 1986, 2022" },
  "Bosnia": { rank: 74, strength: 66, form: "L-L-W-D-L", players: "Edin Džeko, Ermedin Demirović", history: "Tham dự World Cup 2014" },
  "Qatar": { rank: 38, strength: 68, form: "W-D-W-L-D", players: "Akram Afif, Almoez Ali", history: "Chủ nhà World Cup 2022, Vô địch Asian Cup 2019, 2023" },
  "Thụy Sĩ": { rank: 19, strength: 77, form: "W-D-W-D-L", players: "Granit Xhaka, Manuel Akanji", history: "Vào Tứ kết 1934, 1938, 1954; Vòng 16 đội 2014, 2018, 2022" },
  "Brazil": { rank: 5, strength: 88, form: "W-D-W-W-L", players: "Vinícius Júnior, Rodrygo", history: "5 lần vô địch World Cup (Kỷ lục thế giới)" },
  "Morocco": { rank: 12, strength: 82, form: "W-W-D-W-L", players: "Achraf Hakimi, Sofyan Amrabat", history: "Hạng 4 World Cup 2022 (Đội châu Phi đầu tiên vào bán kết)" },
  "Haiti": { rank: 86, strength: 58, form: "L-D-W-L-D", players: "Duckens Nazon, Frantzdy Pierrot", history: "Tham dự World Cup 1974" },
  "Scotland": { rank: 39, strength: 71, form: "L-D-L-W-D", players: "Andrew Robertson, Scott McTominay", history: "Tham dự World Cup 8 lần (đều dừng bước ở vòng bảng)" },
  "Mỹ": { rank: 11, strength: 80, form: "W-W-L-D-W", players: "Christian Pulisic, Weston McKennie", history: "Hạng 3 World Cup 1930, Tứ kết 2002, Vòng 16 đội 2022" },
  "Paraguay": { rank: 56, strength: 68, form: "D-L-W-D-L", players: "Miguel Almirón, Julio Enciso", history: "Vào Tứ kết World Cup 2010" },
  "Úc": { rank: 24, strength: 74, form: "W-W-D-L-W", players: "Harry Souttar, Mathew Ryan", history: "Vòng 16 đội World Cup 2006, 2022" },
  "Thổ Nhĩ Kỳ": { rank: 35, strength: 73, form: "W-L-D-W-D", players: "Hakan Çalhanoğlu, Arda Güler", history: "Hạng 3 World Cup 2002" },
  "Đức": { rank: 16, strength: 82, form: "W-D-W-D-W", players: "Florian Wirtz, Jamal Musiala", history: "4 lần vô địch World Cup, 4 lần Á quân" },
  "Curaçao": { rank: 90, strength: 56, form: "L-D-L-W-D", players: "Juninho Bacuna, Leandro Bacuna", history: "Chưa từng tham dự World Cup trước 2026" },
  "Bờ Biển Ngà": { rank: 39, strength: 73, form: "W-W-D-L-W", players: "Franck Kessié, Simon Adingra", history: "Vô địch CAN 2015, 2023; Tham dự World Cup 2006, 2010, 2014" },
  "Ecuador": { rank: 31, strength: 74, form: "W-D-L-W-D", players: "Moisés Caicedo, Enner Valencia", history: "Vào vòng 16 đội World Cup 2006" },
  "Hà Lan": { rank: 7, strength: 84, form: "W-W-D-L-W", players: "Virgil van Dijk, Cody Gakpo", history: "3 lần Á quân World Cup (1974, 1978, 2010), Hạng 3 năm 2014" },
  "Nhật Bản": { rank: 18, strength: 79, form: "W-W-W-D-L", players: "Kaoru Mitoma, Wataru Endo", history: "4 lần vào Vòng 16 đội World Cup (2002, 2010, 2018, 2022)" },
  "Thụy Điển": { rank: 28, strength: 75, form: "W-L-W-D-L", players: "Alexander Isak, Dejan Kulusevski", history: "Á quân World Cup 1958, Hạng 3 năm 1950, 1994" },
  "Tunisia": { rank: 41, strength: 68, form: "D-L-W-D-W", players: "Ellyes Skhiri, Youssef Msakni", history: "Tham dự World Cup 6 lần (đều dừng bước ở vòng bảng)" },
  "Bỉ": { rank: 3, strength: 83, form: "W-L-D-W-D", players: "Kevin De Bruyne, Romelu Lukaku", history: "Hạng 3 World Cup 2018, Hạng 4 năm 1986" },
  "Ai Cập": { rank: 36, strength: 71, form: "W-D-L-W-D", players: "Mohamed Salah, Trezeguet", history: "Tham dự World Cup 1934, 1990, 2018" },
  "Iran": { rank: 20, strength: 73, form: "W-W-D-L-W", players: "Mehdi Taremi, Sardar Azmoun", history: "Tham dự World Cup 6 lần (đều dừng bước ở vòng bảng)" },
  "New Zealand": { rank: 104, strength: 55, form: "D-W-L-D-L", players: "Chris Wood, Liberato Cacace", history: "Tham dự World Cup 1982, 2010 (bất bại vòng bảng 2010)" },
  "Tây Ban Nha": { rank: 8, strength: 87, form: "W-W-W-D-W", players: "Rodri, Lamine Yamal", history: "Vô địch World Cup 2010, Vô địch Euro 1964, 2008, 2012, 2024" },
  "Cape Verde": { rank: 65, strength: 64, form: "D-W-L-D-L", players: "Ryan Mendes, Logan Costa", history: "Vào Tứ kết CAN 2013, 2023" },
  "Ả Rập Xê Út": { rank: 53, strength: 66, form: "D-L-W-L-D", players: "Salem Al-Dawsari, Firas Al-Buraikan", history: "Vòng 16 đội World Cup 1994, Thắng Argentina 2-1 năm 2022" },
  "Uruguay": { rank: 11, strength: 81, form: "W-D-W-L-W", players: "Federico Valverde, Darwin Núñez", history: "2 lần vô địch World Cup (1930, 1950), Hạng 4 năm 2010" },
  "Pháp": { rank: 2, strength: 89, form: "W-W-D-W-L", players: "Kylian Mbappé, Antoine Griezmann", history: "2 lần vô địch World Cup (1998, 2018), Á quân 2006, 2022" },
  "Senegal": { rank: 17, strength: 77, form: "W-D-W-L-W", players: "Sadio Mané, Nicolas Jackson", history: "Tứ kết World Cup 2002, Vòng 16 đội 2022" },
  "Iraq": { rank: 58, strength: 66, form: "W-W-L-D-W", players: "Aymen Hussein, Jalal Hassan", history: "Tham dự World Cup 1986, Vô địch Asian Cup 2007" },
  "Na Uy": { rank: 47, strength: 74, form: "W-L-D-W-L", players: "Erling Haaland, Martin Ødegaard", history: "Vòng 16 đội World Cup 1998" },
  "Argentina": { rank: 1, strength: 91, form: "W-W-W-D-W", players: "Lionel Messi, Lautaro Martínez", history: "3 lần vô địch World Cup (1978, 1986, 2022), Á quân Euro/Copa" },
  "Algeria": { rank: 43, strength: 72, form: "W-D-L-W-D", players: "Riyad Mahrez, Rayan Aït-Nouri", history: "Vòng 16 đội World Cup 2014" },
  "Áo": { rank: 25, strength: 75, form: "W-D-L-W-W", players: "Marcel Sabitzer, Konrad Laimer", history: "Hạng 3 World Cup 1954" },
  "Jordan": { rank: 71, strength: 63, form: "L-W-D-W-D", players: "Musa Al-Taamari, Yazan Al-Naimat", history: "Á quân Asian Cup 2023" },
  "Bồ Đào Nha": { rank: 6, strength: 85, form: "W-W-D-W-L", players: "Cristiano Ronaldo, Bruno Fernandes", history: "Hạng 3 World Cup 1966, Hạng 4 năm 2006, Vô địch Euro 2016" },
  "CHDC Congo": { rank: 67, strength: 65, form: "D-W-L-D-W", players: "Chancel Mbemba, Yoane Wissa", history: "Tham dự World Cup 1974 (dưới tên Zaire)" },
  "Uzbekistan": { rank: 66, strength: 66, form: "W-D-W-L-D", players: "Eldor Shomurodov, Abbosbek Fayzullaev", history: "Á quân U23 châu Á, Lần đầu dự World Cup" },
  "Colombia": { rank: 12, strength: 81, form: "W-W-D-W-L", players: "Luis Díaz, James Rodríguez", history: "Tứ kết World Cup 2014" },
  "Anh": { rank: 4, strength: 87, form: "W-D-W-L-W", players: "Harry Kane, Jude Bellingham", history: "Vô địch World Cup 1966, Hạng 4 năm 1990, 2018, Á quân Euro 2020, 2024" },
  "Croatia": { rank: 10, strength: 80, form: "D-W-L-W-W", players: "Luka Modrić, Joško Gvardiol", history: "Á quân World Cup 2018, Hạng 3 năm 1998, 2022" },
  "Ghana": { rank: 64, strength: 67, form: "W-L-D-W-L", players: "Mohammed Kudus, Thomas Partey", history: "Tứ kết World Cup 2010" },
  "Panama": { rank: 45, strength: 69, form: "L-W-D-L-W", players: "Adalberto Carrasquilla, Jose Cordoba", history: "Tham dự World Cup 2018" }
};

// Hardcoded historic head-to-head encounters to ensure realistic simulation
const h2hHistory = {
  "Argentina-Đức": { text: "Gặp nhau 7 lần tại World Cup. Đức thắng 4, Argentina thắng 2. Gần nhất Chung kết 2014 Đức thắng 1-0.", homeWin: 2, draw: 1, awayWin: 4 },
  "Pháp-Tây Ban Nha": { text: "Đối đầu kịch tính tại Euro/World Cup. Tây Ban Nha thắng Pháp 2-1 tại bán kết Euro 2024.", homeWin: 3, draw: 2, awayWin: 4 },
  "Anh-Croatia": { text: "Chạm trán tại Bán kết WC 2018 (Croatia thắng 2-1). Anh phục thù tại Euro 2020 thắng 1-0.", homeWin: 5, draw: 2, awayWin: 3 },
  "Nhật Bản-Tây Ban Nha": { text: "Nhật Bản tạo địa chấn thắng Tây Ban Nha 2-1 tại vòng bảng World Cup 2022.", homeWin: 1, draw: 0, awayWin: 2 },
  "Mỹ-Paraguay": { text: "Lịch sử nghiêng về Mỹ với 3 thắng, 1 hòa, 1 thua. Gặp gần nhất tại Copa America 2016 Mỹ thắng 1-0.", homeWin: 3, draw: 1, awayWin: 1 },
  "Brazil-Pháp": { text: "Pháp là khắc tinh của Brazil tại World Cup (thắng Tứ kết 1986, Chung kết 1998, Tứ kết 2006).", homeWin: 2, draw: 2, awayWin: 4 }
};

// Main AI Prediction function
export function getAiPrediction(teamHome, teamAway) {
  const home = teamData[teamHome] || { rank: 100, strength: 55, form: "D-D-D-D-D", players: "N/A", history: "N/A" };
  const away = teamData[teamAway] || { rank: 100, strength: 55, form: "D-D-D-D-D", players: "N/A", history: "N/A" };

  // Calculate Win, Draw, Loss probabilities based on strength difference
  const diff = home.strength - away.strength;
  
  // Base values for home advantage (slight advantage in tournament format)
  let homeWinProb = 38 + diff * 1.5;
  let awayWinProb = 34 - diff * 1.5;
  let drawProb = 28;

  // Adjust probabilities based on recent form (form: W=3, D=1, L=0)
  const calcFormScore = (formStr) => {
    return formStr.split("-").reduce((acc, curr) => acc + (curr === "W" ? 3 : curr === "D" ? 1 : 0), 0);
  };
  const homeFormScore = calcFormScore(home.form);
  const awayFormScore = calcFormScore(away.form);
  const formDiff = homeFormScore - awayFormScore;

  homeWinProb += formDiff * 0.5;
  awayWinProb -= formDiff * 0.5;

  // Clamp probabilities
  homeWinProb = Math.max(10, Math.min(85, homeWinProb));
  awayWinProb = Math.max(10, Math.min(85, awayWinProb));
  drawProb = 100 - homeWinProb - awayWinProb;

  // Search for head-to-head records
  const h2hKey1 = `${teamHome}-${teamAway}`;
  const h2hKey2 = `${teamAway}-${teamHome}`;
  let h2hText = "Hai đội chưa có nhiều lần chạm trán chính thức trong lịch sử các giải đấu lớn gần đây.";
  
  if (h2hHistory[h2hKey1]) {
    h2hText = h2hHistory[h2hKey1].text;
  } else if (h2hHistory[h2hKey2]) {
    h2hText = h2hHistory[h2hKey2].text;
  }

  // Calculate suggested scores based on Poisson expected goals
  // Lambda values represent expected goals
  let lambdaHome = 1.3 + (diff * 0.04);
  let lambdaAway = 1.1 - (diff * 0.04);

  // Form multiplier
  lambdaHome *= (1 + (homeFormScore - 9) * 0.03);
  lambdaAway *= (1 + (awayFormScore - 9) * 0.03);

  lambdaHome = Math.max(0.2, Math.min(4.5, lambdaHome));
  lambdaAway = Math.max(0.2, Math.min(4.5, lambdaAway));

  // Determine exact scores (rounding expected goals with dynamic variance)
  let suggestedHome = Math.round(lambdaHome);
  let suggestedAway = Math.round(lambdaAway);

  // Avoid tie scores if win probability is heavily skewed
  if (suggestedHome === suggestedAway) {
    if (homeWinProb - awayWinProb > 15) {
      suggestedHome += 1;
    } else if (awayWinProb - homeWinProb > 15) {
      suggestedAway += 1;
    }
  }

  // Generate dynamic analysis text in Vietnamese
  let analysis = `**Nhận định chuyên môn:**\n`;
  
  if (diff > 10) {
    analysis += `**${teamHome}** (Hạng ${home.rank} FIFA) vượt trội hơn hẳn so với **${teamAway}** (Hạng ${away.rank} FIFA). `;
    analysis += `${teamHome} sở hữu đội hình chất lượng cao với các nhân tố đột biến như ${home.players}. `;
    analysis += `Phong độ gần đây của ${teamHome} (${home.form}) là rất ấn tượng so với đối thủ. `;
  } else if (diff < -10) {
    analysis += `**${teamAway}** (Hạng ${away.rank} FIFA) được đánh giá cao hơn nhiều so với **${teamHome}** (Hạng ${home.rank} FIFA). `;
    analysis += `${teamAway} kiểm soát trận đấu tốt nhờ đẳng cấp của các ngôi sao như ${away.players}. `;
    analysis += `Dù thi đấu quyết tâm, ${teamHome} sẽ gặp vô vàn khó khăn trước sơ đồ chiến thuật kỷ luật của đối thủ. `;
  } else {
    analysis += `Trận đấu giữa **${teamHome}** (Hạng ${home.rank} FIFA) và **${teamAway}** (Hạng ${away.rank} FIFA) được dự báo sẽ cực kỳ cân tài cân sức. `;
    analysis += `Sự đối đầu giữa hai lối chơi: ${teamHome} với sức sáng tạo của ${home.players} và ${teamAway} dựa trên sự bùng nổ của ${away.players}. `;
  }

  analysis += `\n\n**Thống kê Lịch sử & Phong độ:**\n`;
  analysis += `- **Lịch sử chạm trán:** ${h2hText}\n`;
  analysis += `- **Thành tích nổi bật:** ${teamHome} (${home.history}) vs ${teamAway} (${away.history}).\n`;
  
  if (suggestedHome > suggestedAway) {
    analysis += `\n**Dự đoán:** Thế trận nghiêng về **${teamHome}**. AI khuyến nghị đặt niềm tin vào đội nhà với một chiến thắng cách biệt tối thiểu.`;
  } else if (suggestedHome < suggestedAway) {
    analysis += `\n**Dự đoán:** Bản lĩnh của **${teamAway}** sẽ lên tiếng. AI khuyến nghị lựa chọn đội khách giành thắng lợi.`;
  } else {
    analysis += `\n**Dự đoán:** Trận đấu diễn ra giằng co, nhiều khả năng hai đội sẽ chia điểm trong một kịch bản rượt đuổi tỷ số kịch tính.`;
  }

  return {
    homeProb: Math.round(homeWinProb),
    drawProb: Math.round(drawProb),
    awayProb: Math.round(awayWinProb),
    suggestedHomeScore: suggestedHome,
    suggestedAwayScore: suggestedAway,
    analysisText: analysis
  };
}
