// Century: Spice Road - Card Data (Official Game Cards)

// Merchant Cards - Exactly 45 cards as per official game
const MERCHANT_CARDS = [
    // Card 1: Gain YY
    { id: 'gain-yy', name: 'Gain YY', type: 'gain', effect: { yellow: 2 }, description: 'Gain 2 yellow spices' },
    
    // Card 2: Upgrade 2
    { id: 'upgrade-2', name: 'Upgrade 2', type: 'upgrade', effect: { amount: 2 }, description: 'Upgrade up to 2 spice levels' },
    
    // Card 3: YYY -> B
    { id: 'trade-yyy-b', name: 'YYY → B', type: 'trade', effect: { input: { yellow: 3 }, output: { brown: 1 } }, description: 'Trade 3 yellow for 1 brown' },
    
    // Card 4: R -> YYY
    { id: 'trade-r-yyy', name: 'R → YYY', type: 'trade', effect: { input: { red: 1 }, output: { yellow: 3 } }, description: 'Trade 1 red for 3 yellow' },
    
    // Card 5: Gain YR
    { id: 'gain-yr', name: 'Gain YR', type: 'gain', effect: { yellow: 1, red: 1 }, description: 'Gain 1 yellow and 1 red' },
    
    // Card 6: Gain G
    { id: 'gain-g', name: 'Gain G', type: 'gain', effect: { green: 1 }, description: 'Gain 1 green spice' },
    
    // Card 7: Gain YYY
    { id: 'gain-yyy', name: 'Gain YYY', type: 'gain', effect: { yellow: 3 }, description: 'Gain 3 yellow spices' },
    
    // Card 8: Upgrade 3
    { id: 'upgrade-3', name: 'Upgrade 3', type: 'upgrade', effect: { amount: 3 }, description: 'Upgrade up to 3 spice levels' },
    
    // Card 9: GG -> RRRYY
    { id: 'trade-gg-rrryy', name: 'GG → RRRYY', type: 'trade', effect: { input: { green: 2 }, output: { red: 3, yellow: 2 } }, description: 'Trade 2 green for 3 red and 2 yellow' },
    
    // Card 10: GG -> BRYY
    { id: 'trade-gg-bryy', name: 'GG → BRYY', type: 'trade', effect: { input: { green: 2 }, output: { brown: 1, red: 1, yellow: 2 } }, description: 'Trade 2 green for 1 brown, 1 red, and 2 yellow' },
    
    // Card 11: B -> GYYY
    { id: 'trade-b-gyyy', name: 'B → GYYY', type: 'trade', effect: { input: { brown: 1 }, output: { green: 1, yellow: 3 } }, description: 'Trade 1 brown for 1 green and 3 yellow' },
    
    // Card 12: RR -> GYYY
    { id: 'trade-rr-gyyy', name: 'RR → GYYY', type: 'trade', effect: { input: { red: 2 }, output: { green: 1, yellow: 3 } }, description: 'Trade 2 red for 1 green and 3 yellow' },
    
    // Card 13: RRR -> GGYY
    { id: 'trade-rrr-ggyy', name: 'RRR → GGYY', type: 'trade', effect: { input: { red: 3 }, output: { green: 2, yellow: 2 } }, description: 'Trade 3 red for 2 green and 2 yellow' },
    
    // Card 14: B -> RRYY
    { id: 'trade-b-rryy', name: 'B → RRYY', type: 'trade', effect: { input: { brown: 1 }, output: { red: 2, yellow: 2 } }, description: 'Trade 1 brown for 2 red and 2 yellow' },
    
    // Card 15: YYYY -> GG
    { id: 'trade-yyyy-gg', name: 'YYYY → GG', type: 'trade', effect: { input: { yellow: 4 }, output: { green: 2 } }, description: 'Trade 4 yellow for 2 green' },
    
    // Card 16: Gain RYY
    { id: 'gain-ryy', name: 'Gain RYY', type: 'gain', effect: { red: 1, yellow: 2 }, description: 'Gain 1 red and 2 yellow' },
    
    // Card 17: Gain YYYY
    { id: 'gain-yyyy', name: 'Gain YYYY', type: 'gain', effect: { yellow: 4 }, description: 'Gain 4 yellow spices' },
    
    // Card 18: Gain B
    { id: 'gain-b', name: 'Gain B', type: 'gain', effect: { brown: 1 }, description: 'Gain 1 brown spice' },
    
    // Card 19: Gain RR
    { id: 'gain-rr', name: 'Gain RR', type: 'gain', effect: { red: 2 }, description: 'Gain 2 red spices' },
    
    // Card 20: Gain YG
    { id: 'gain-yg', name: 'Gain YG', type: 'gain', effect: { yellow: 1, green: 1 }, description: 'Gain 1 yellow and 1 green' },
    
    // Card 21: YY -> G
    { id: 'trade-yy-g', name: 'YY → G', type: 'trade', effect: { input: { yellow: 2 }, output: { green: 1 } }, description: 'Trade 2 yellow for 1 green' },
    
    // Card 22: RY -> B
    { id: 'trade-ry-b', name: 'RY → B', type: 'trade', effect: { input: { red: 1, yellow: 1 }, output: { brown: 1 } }, description: 'Trade 1 red and 1 yellow for 1 brown' },
    
    // Card 23: G -> RR
    { id: 'trade-g-rr', name: 'G → RR', type: 'trade', effect: { input: { green: 1 }, output: { red: 2 } }, description: 'Trade 1 green for 2 red' },
    
    // Card 24: RR -> BYY
    { id: 'trade-rr-byy', name: 'RR → BYY', type: 'trade', effect: { input: { red: 2 }, output: { brown: 1, yellow: 2 } }, description: 'Trade 2 red for 1 brown and 2 yellow' },
    
    // Card 25: YYY -> RG
    { id: 'trade-yyy-rg', name: 'YYY → RG', type: 'trade', effect: { input: { yellow: 3 }, output: { red: 1, green: 1 } }, description: 'Trade 3 yellow for 1 red and 1 green' },
    
    // Card 26: GG -> BRR
    { id: 'trade-gg-brr', name: 'GG → BRR', type: 'trade', effect: { input: { green: 2 }, output: { brown: 1, red: 2 } }, description: 'Trade 2 green for 1 brown and 2 red' },
    
    // Card 27: RRR -> BGY
    { id: 'trade-rrr-bgy', name: 'RRR → BGY', type: 'trade', effect: { input: { red: 3 }, output: { brown: 1, green: 1, yellow: 1 } }, description: 'Trade 3 red for 1 brown, 1 green, and 1 yellow' },
    
    // Card 28: B -> RRR
    { id: 'trade-b-rrr', name: 'B → RRR', type: 'trade', effect: { input: { brown: 1 }, output: { red: 3 } }, description: 'Trade 1 brown for 3 red' },
    
    // Card 29: RRR -> BB
    { id: 'trade-rrr-bb', name: 'RRR → BB', type: 'trade', effect: { input: { red: 3 }, output: { brown: 2 } }, description: 'Trade 3 red for 2 brown' },
    
    // Card 30: B -> GRY
    { id: 'trade-b-gry', name: 'B → GRY', type: 'trade', effect: { input: { brown: 1 }, output: { green: 1, red: 1, yellow: 1 } }, description: 'Trade 1 brown for 1 green, 1 red, and 1 yellow' },
    
    // Card 31: G -> RRY
    { id: 'trade-g-rry', name: 'G → RRY', type: 'trade', effect: { input: { green: 1 }, output: { red: 2, yellow: 1 } }, description: 'Trade 1 green for 2 red and 1 yellow' },
    
    // Card 32: G -> RYYYY
    { id: 'trade-g-ryyyy', name: 'G → RYYYY', type: 'trade', effect: { input: { green: 1 }, output: { red: 1, yellow: 4 } }, description: 'Trade 1 green for 1 red and 4 yellow' },
    
    // Card 33: YYYYY -> BB
    { id: 'trade-yyyyy-bb', name: 'YYYYY → BB', type: 'trade', effect: { input: { yellow: 5 }, output: { brown: 2 } }, description: 'Trade 5 yellow for 2 brown' },
    
    // Card 34: YYYY -> GB
    { id: 'trade-yyyy-gb', name: 'YYYY → GB', type: 'trade', effect: { input: { yellow: 4 }, output: { green: 1, brown: 1 } }, description: 'Trade 4 yellow for 1 green and 1 brown' },
    
    // Card 35: BB -> GGRRR
    { id: 'trade-bb-ggrrr', name: 'BB → GGRRR', type: 'trade', effect: { input: { brown: 2 }, output: { green: 2, red: 3 } }, description: 'Trade 2 brown for 2 green and 3 red' },
    
    // Card 36: BB -> GGGRY
    { id: 'trade-bb-gggry', name: 'BB → GGGRY', type: 'trade', effect: { input: { brown: 2 }, output: { green: 3, red: 1, yellow: 1 } }, description: 'Trade 2 brown for 3 green, 1 red, and 1 yellow' },
    
    // Card 37: YYYYY -> GGG
    { id: 'trade-yyyyy-ggg', name: 'YYYYY → GGG', type: 'trade', effect: { input: { yellow: 5 }, output: { green: 3 } }, description: 'Trade 5 yellow for 3 green' },
    
    // Card 38: GYY -> BB
    { id: 'trade-gyy-bb', name: 'GYY → BB', type: 'trade', effect: { input: { green: 1, yellow: 2 }, output: { brown: 2 } }, description: 'Trade 1 green and 2 yellow for 2 brown' },
    
    // Card 39: GGG -> BBB
    { id: 'trade-ggg-bbb', name: 'GGG → BBB', type: 'trade', effect: { input: { green: 3 }, output: { brown: 3 } }, description: 'Trade 3 green for 3 brown' },
    
    // Card 40: RRR -> GGG
    { id: 'trade-rrr-ggg', name: 'RRR → GGG', type: 'trade', effect: { input: { red: 3 }, output: { green: 3 } }, description: 'Trade 3 red for 3 green' },
    
    // Card 41: YYY -> RRR
    { id: 'trade-yyy-rrr', name: 'YYY → RRR', type: 'trade', effect: { input: { yellow: 3 }, output: { red: 3 } }, description: 'Trade 3 yellow for 3 red' },
    
    // Card 42: YY -> RR
    { id: 'trade-yy-rr', name: 'YY → RR', type: 'trade', effect: { input: { yellow: 2 }, output: { red: 2 } }, description: 'Trade 2 yellow for 2 red' },
    
    // Card 43: GG -> BB
    { id: 'trade-gg-bb', name: 'GG → BB', type: 'trade', effect: { input: { green: 2 }, output: { brown: 2 } }, description: 'Trade 2 green for 2 brown' },
    
    // Card 44: RR -> GG
    { id: 'trade-rr-gg', name: 'RR → GG', type: 'trade', effect: { input: { red: 2 }, output: { green: 2 } }, description: 'Trade 2 red for 2 green' },
    
    // Card 45: B -> GG
    { id: 'trade-b-gg', name: 'B → GG', type: 'trade', effect: { input: { brown: 1 }, output: { green: 2 } }, description: 'Trade 1 brown for 2 green' }
];

// Victory Point Cards
const VICTORY_CARDS = [
    // Simple cost cards
    { id: 'victory-yyrr-6', points: 6, cost: { yellow: 2, red: 2 }, description: '6 points for 2 yellow, 2 red' },
    { id: 'victory-yyyrr-7', points: 7, cost: { yellow: 3, red: 2 }, description: '7 points for 3 yellow, 2 red' },
    { id: 'victory-rrrr-8', points: 8, cost: { red: 4 }, description: '8 points for 4 red' },
    { id: 'victory-yygg-8', points: 8, cost: { yellow: 2, green: 2 }, description: '8 points for 2 yellow, 2 green' },
    { id: 'victory-yyrrr-8', points: 8, cost: { yellow: 2, red: 3 }, description: '8 points for 2 yellow, 3 red' },
    { id: 'victory-yyygg-9', points: 9, cost: { yellow: 3, green: 2 }, description: '9 points for 3 yellow, 2 green' },
    { id: 'victory-rrgg-10', points: 10, cost: { red: 2, green: 2 }, description: '10 points for 2 red, 2 green' },
    { id: 'victory-rrrrr-10', points: 10, cost: { red: 5 }, description: '10 points for 5 red' },
    { id: 'victory-yybb-10', points: 10, cost: { yellow: 2, brown: 2 }, description: '10 points for 2 yellow, 2 brown' },
    { id: 'victory-yyggg-11', points: 11, cost: { yellow: 2, green: 3 }, description: '11 points for 2 yellow, 3 green' },
    { id: 'victory-yyybb-11', points: 11, cost: { yellow: 3, brown: 2 }, description: '11 points for 3 yellow, 2 brown' },
    { id: 'victory-gggg-12', points: 12, cost: { green: 4 }, description: '12 points for 4 green' },
    { id: 'victory-rrbb-12', points: 12, cost: { red: 2, brown: 2 }, description: '12 points for 2 red, 2 brown' },
    { id: 'victory-rrrgg-12', points: 12, cost: { red: 3, green: 2 }, description: '12 points for 3 red, 2 green' },
    { id: 'victory-rrggg-13', points: 13, cost: { red: 2, green: 3 }, description: '13 points for 2 red, 3 green' },
    { id: 'victory-ggbb-14', points: 14, cost: { green: 2, brown: 2 }, description: '14 points for 2 green, 2 brown' },
    { id: 'victory-rrrbb-14', points: 14, cost: { red: 3, brown: 2 }, description: '14 points for 3 red, 2 brown' },
    { id: 'victory-yybbb-14', points: 14, cost: { yellow: 2, brown: 3 }, description: '14 points for 2 yellow, 3 brown' },
    { id: 'victory-ggggg-15', points: 15, cost: { green: 5 }, description: '15 points for 5 green' },
    { id: 'victory-bbbb-16', points: 16, cost: { brown: 4 }, description: '16 points for 4 brown' },
    { id: 'victory-rrbbb-16', points: 16, cost: { red: 2, brown: 3 }, description: '16 points for 2 red, 3 brown' },
    { id: 'victory-gggbb-17', points: 17, cost: { green: 3, brown: 2 }, description: '17 points for 3 green, 2 brown' },
    { id: 'victory-ggbbb-18', points: 18, cost: { green: 2, brown: 3 }, description: '18 points for 2 green, 3 brown' },
    { id: 'victory-bbbbb-20', points: 20, cost: { brown: 5 }, description: '20 points for 5 brown' },
    
    // Bonus spice cards
    { id: 'victory-yyrb-9', points: 9, cost: { yellow: 2, red: 1, brown: 1 }, description: '9 points for 2 yellow, 1 red, 1 brown' },
    { id: 'victory-rrgb-12', points: 12, cost: { red: 2, green: 1, brown: 1 }, description: '12 points for 2 red, 1 green, 1 brown' },
    { id: 'victory-yggb-12', points: 12, cost: { yellow: 1, green: 2, brown: 1 }, description: '12 points for 1 yellow, 2 green, 1 brown' },
    { id: 'victory-yyrrgg-13', points: 13, cost: { yellow: 2, red: 2, green: 2 }, description: '13 points for 2 yellow, 2 red, 2 green' },
    { id: 'victory-yyrrbb-15', points: 15, cost: { yellow: 2, red: 2, brown: 2 }, description: '15 points for 2 yellow, 2 red, 2 brown' },
    { id: 'victory-yyggbb-17', points: 17, cost: { yellow: 2, green: 2, brown: 2 }, description: '17 points for 2 yellow, 2 green, 2 brown' },
    { id: 'victory-rrggbb-19', points: 19, cost: { red: 2, green: 2, brown: 2 }, description: '19 points for 2 red, 2 green, 2 brown' },
    { id: 'victory-yrgb-12', points: 12, cost: { yellow: 1, red: 1, green: 1, brown: 1 }, description: '12 points for 1 of each spice' },
    { id: 'victory-yyyrgb-14', points: 14, cost: { yellow: 3, red: 1, green: 1, brown: 1 }, description: '14 points for 3 yellow, 1 red, 1 green, 1 brown' },
    { id: 'victory-yrrrgb-16', points: 16, cost: { yellow: 1, red: 3, green: 1, brown: 1 }, description: '16 points for 1 yellow, 3 red, 1 green, 1 brown' },
    { id: 'victory-yrgggb-18', points: 18, cost: { yellow: 1, red: 1, green: 3, brown: 1 }, description: '18 points for 1 yellow, 1 red, 3 green, 1 brown' },
    { id: 'victory-yrgbbb-20', points: 20, cost: { yellow: 1, red: 1, green: 1, brown: 3 }, description: '20 points for 1 yellow, 1 red, 1 green, 3 brown' }
];