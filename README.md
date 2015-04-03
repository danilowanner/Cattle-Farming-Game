# Setting up the Cattle Farming Game
1. You need to run an Apache and MySQL Server, for instance with MAMP (Mac, http://www.mamp.info/), WAMP (Windows, http://www.wampserver.com).
2. Fill out the configuration file at play/config.php.
3. Import the default scheme including treatments and settings (default_database_scheme.sql) into your MySQL database.
4. Run both Apache and MySQL and navigate your browser to the correct local address (default: http://localhost:8888)

# About the Cattle Farming Game
The Cattle Farming Game is a tool developed in a research project by the ETH Zurich (Eidgenössische Technische Hochschule Zürich) and the FHNW (University of Applied Sciences Northwestern Switzerland). You can see an online version of the project here: https://www.environmental-games.uni-osnabrueck.de/cattle/

# Additional Information 

## The SQL has the following structure:

### Player
The table "**player**" contains all information from the initial questionnaire + information on payoff, location and the assistant present during this session. The last are entered by hand. The column "treatment" identifies the treatment assigned to the player for the treatment round

### Game
The table "**game**" contains a row for each "game" played. A new game starts whenever a player clicks on the "Start Game" button on the game.html. It is linked to the "player" table via a unique player ID.
The column "Treatment" in the game table refers to the treatment of this particular game. Note that the order is "8-7-PLAYER TREATMENT" for all players. Treatment 8 is the training round and treatment 7 is the baseline round. A game is "finished" when a player clicks on "finish game" in the last round of a phase.

### Round
The table "**round**" contains all data for a specific year. It is linked to the tables "player" resp. "game" via a unique player resp. gameID.
Description of variables in "round":
- **cowPriceExpectation:** The expectation of the future cow price on a scale from 1 - 5, measured once in 4 rounds in the Treatment Phase.
- **carbonPriceExpectation:** - The expectation of the future carbon price on a scale from 1 - 5, measured once in 4 rounds in the Treatment Phase in Treatments with Carbon Price.
- **savings:** The amount of savings at the end of this round
- **loans:** The amount of loans at the end of this round
- **subsidies:** The amount of subsidies paid in this specific round
- **actual:** The actual emissions (=5'000 * deforested), cumulative
- **tco2:** The difference between the baseline emissions (see table "treatment") and "actual", cumulative. Note that this value is only meaningful as long as the Baseline is defined, i.e. till round 25.
- **tco2Sold:** The amount of CO2 sold, cumulative. Note that this can be different from tco2, in case a player first deforests slower than the baseline, selling CO2 and then later deforests faster than the Baseline.
- **cowsSold:** Number of cows sold, cumulative, monotonically increasing
- **cowsBought:** Number of cows bought, cumulative, monotonically increasing
- **deforested:** Number of cells deforested, cumulative (0-51), monotonically increasing
- **intensified** Number of cells intensified, cumulative (0-64), monotonically increasing
- **restored:** Number of cells restored, cumulative (can be larger than 64, as individual cells can be restored several time throughout the game), monotonically increasing
- **deforestLicense:** binary, did players buy a license to deforest (THIS IS A LEFT-OVER VARIABLE FROM AN EARLIER VERSION, WAS NOT USED IN THE GAME AFTER PRETESTING)
- **landValue:** current value of the land according to the calculation in the value of "landValue" in the table "treatment" for the treatment of the game.
- **avgDegradation:** average degradation of all pasture cells. Attention: The value is "NULL" in the first round, needs to be adjusted for evaluation. 

### Treatment
The table "**treatment**" contains all information on the treatments. To create and modify treatments, only this table should be modified.
- **startPastureTileNumber:** Number of cells in pasture in the first year
- **startYear:** numeric of the first year of the game
- **endYear:** numeric of the last year of the game
- **restoreCost:** cost of restoring one point of degradation
- **deforestCost:** cost to deforest one cell
- **intensifyCost:** cost to intensify one cell
- **minIntensifyTiles:** minimum number of cells that need to be intensified when intensifying the first time (THIS WAS NOT USED IN THE EXPERIMENT, IT COULD MODEL A SITUATION WHERE A CERTAIN MINIMUM AREA NEEDS TO BE INTENSIFIED AT ONCE TO BE FEASIBLE, WOULD BE MORE RELEVANT FOR A MODEL OF SMALL-SCALE FARMERS)
- **cowCost:** Cost to purchase a calve
- **cowValue:** price paid for a cow (CURRENTLY AS LIST OF PRICES FOR EACH ROUND), note the variable "age" used to discount the value of younger cows.
- **savingsInterest:** Interest on savings (SET TO ZERO IN THE GAME)
- **loanInterest:** Interest on loans (THE LOAN LIMIT WAS DEACTIVATED AFTER PRE-TESTING. THE LOAN LIMIT ALLOWS FOR A TWO-STAGE MODEL OF CREDIT. TO USE THIS FEATURE, YOU NEED TO RE-ACTIVATE THE "TAKE LOAN" BUTTON IN THE HTML/PHP FILE)
- **repairCost:** annual maintenance cost 
- **deforestLicenceCost:** cost of a license to deforest (THE LICENSE WAS DEACTIVATED AFTER PRE-TESTING. THE LICENSE ALLOWS FOR A TWO-STAGE MODEL OF DEFORESTATION, WHERE THE FIRST X CELLS PER YEAR CAN BE DEFORESTED EVERY YEAR BUT A LICENSE IS REQUIRED TO DEFOREST MORE. TO USE THIS FEATURE, YOU NEED TO RE-ACTIVATE IT IN THE HTML/PHP FILE)
- **personalCost:** annual cost
- **baseline:** carbon baseline (CURRENTLY GIVEN IN CELLS DEFORESTED AND MULTIPLIED BY 5'000 BEFORE RETURNING)
- **actual:** formula to calculate the actual emissions based on deforestation (CURRENTLY DEFORESTATION * 5'000)
- **tco2:** Tons CO2 (CURRENTLY: BASELINE - ACTUAL)
- **carbonPrice:** carbon price
- **forest:** Number of cells in forest (USED FOR PER HECTAR PAYMENTS)
- **forestPrice:** Price in per hectare payments
- **subsidies:** formulae for calculation of subsidies
- **showCarbonSubsidies:** binary to show the carbon subsidies in the financial statistics
- **showForestSubsidies:** binary to show the per hectare subsidies in the financial statistics
- **loanIncreament:** defines the minimum increament when taking / amortizing loans (NOT USED IN THE EXPERIMENT, AS NO ACTIVE LOAN MANAGEMENT WAS INCLUDED)
- **loanLimit:** defines the loan limit (NOT USED IN THE EXPERIMENT)
- **showDialogs:** defines when to show the dialogs asking for the price expectations. Automatically asks for carbon price when carbon subsidies are active.
- **landValue:** defines the land value

### Videotutorial
The table "videotutorial" specifies the location of the instruction videos for each treatment.

### GlobalSettings
The table "globalSettings" defines if music is on/off for all players and if players are allowed to start the main game.

### Highscore
The table "highscore" shows the highscore table.

  
