<?php
//phpinfo();

require ('config.php');

ini_set('display_errors','On');
ini_set('log_errors', 'Off');

ini_set('session.use_only_cookies', 1);
ini_set('session.use_trans_sid',    0);
ini_set('session.gc_maxlifetime', 345600);

session_save_path("/nas/stim/play/sessions");


$server   = 'mysql:dbname='.DB_NAME.'; host='.DB_HOST.'; port='.DB_PORT;
$pdo = new PDO($server, DB_USER, DB_PASSWORD);

// Setup Session and corresponding User
session_set_cookie_params(31536000); // Lebensdauer 1 Jahr
session_start();

$playerID = isset($_SESSION['playerID']) ? $_SESSION['playerID'] : false;

// ----------------
// Helper Functions
function createInsertStatement($table,$data)
{
	// Insert into MySQL
	$statement = "INSERT INTO ".$table;
	
	$keys = "(";
	$values = "(";
	$i = 0;
	foreach ($data as $key => $value)
	{
		if($i>0) { $keys .= ","; $values .= ","; }
		switch($value)
		{
			case "true": $value=1;
				$keys .= "`". $key ."`";
				$values .= "TRUE";
				break;
			case "NULL":
			case "NOW()":
				$keys .= "`". $key ."`";
				$values .= $value ;
				break;
			default:
				$keys .= "`". $key ."`";
				$values .= "'". $value ."'";
		}
		$i++;
	}
	$keys .= ")";
	$values .= ") ";
	
	$statement .= " " .$keys." VALUES ".$values;
	return $statement;
}
function createUpdateStatement($table,$data)
{
	// Update MySQL
	$statement = "UPDATE " .$table. " SET ";
	
	$sets = "";
	$i = 0;
	foreach ($data as $key => $value)
	{
		if($i>0) { $sets .= ","; }
		if($value=="true") $value=1;
		$sets .= "`". $key ."` = '".$value."'";
		$i++;
	}
	
	$statement .= " " .$sets;
	return $statement;
}

// ----------
// Do Actions
$insert = isset($_GET["insert"]) ? $_GET["insert"] : "";
$update = isset($_GET["update"]) ? $_GET["update"] : "";
$get = isset($_GET["get"]) ? $_GET["get"] : "";


if(!empty($insert))
{
	// Remove potential keys that Mysql sets automatically
	unset($_POST["id"]);
	unset($_POST["time"]);
	
	// Automatic Values
	if( isset($_POST["treatment"]) && ($_POST["treatment"]=="auto" || $_POST["treatment"]=="random"))
	{
		$_POST["treatment"] = rand(1, 6);
	}
	
	// Do Server-Side Processing
	switch($insert)
	{
		case "player":
			$playerWithSameEmail = $pdo -> query('SELECT id, email FROM player WHERE email="'.$_POST["email"].'"') -> fetch(PDO::FETCH_OBJ);
			if( $playerWithSameEmail !== false )
			{
				$_SESSION['playerID'] = $playerWithSameEmail -> id; 
				$pdo -> exec( 'UPDATE player SET `treatment` = "'.$_POST["treatment"].'" WHERE id='.$playerWithSameEmail -> id );
			}
			else {
				$pdo->exec(createInsertStatement($insert,$_POST)) or die(print_r($pdo->errorInfo(), true));
				$_SESSION['playerID'] = $pdo->lastInsertId();
			}
			break;
		case "round":
		default:
			$pdo->exec(createInsertStatement($insert,$_POST)) or die(print_r($pdo->errorInfo(), true));
			break;
	}
	
	echo '{"success": '.$_SESSION['playerID'].' }';
}
else if(!empty($update))
{
	$where = isset($_GET["where"]) ? " WHERE ". urldecode($_GET["where"]) : "";
	$statement = createUpdateStatement($update,$_POST) . $where;
	$pdo -> exec( $statement );
	//$pdo -> exec("UPDATE $playertable SET `name` = '$name' WHERE `id` = '$userid'");
	
	echo $statement;
	echo $pdo->lastInsertId();
}
else if(!empty($get))
{
	// Do Server-Side Processing
	function nextTreatment()
	{
		global $pdo, $playerID;
		
		return $pdo -> query("SELECT treatment FROM player WHERE id='$playerID'") -> fetchColumn();
	}
	
	$fetchAll = false;
	switch($get)
	{
		case "game":
			$games = $pdo -> query("SELECT * FROM game WHERE playerID='$playerID' ORDER BY time DESC") -> fetchAll(PDO::FETCH_OBJ);
			
			if( $nextGameTreatment = nextTreatment() )
			{
				$game = (object) array("playerID" => $playerID, "treatment" => $nextGameTreatment);
				$pdo -> exec( createInsertStatement("game",$game) );
				
				$round = (object) array("playerID" => $playerID, "gameID" => $pdo->lastInsertId());
				$pdo -> exec( createInsertStatement("round",$round) );
			}
			else
			{
				echo '{ "error": "No more Games for Player '.$playerID.'" }';
				return;
			}
			break;
		case "videotutorial":
				$where = " WHERE treatment = ".nextTreatment();
			break;
		case "player":
				$where = " WHERE id = ".$playerID;
			break;
		case "globalSettings":
				$fetchAll = true;
			break;
		default:
			break;
	}
	
	//header("content-type:application/json");
	if( !isset($where) ) $where = isset($_GET["where"]) ? " WHERE ". urldecode($_GET["where"]) : "";
	$order = isset($_GET["order"]) ? " ORDER BY ".$_GET["order"] : "";
	
	$query = "SELECT * FROM " . $get . $where . $order;
	
	if($fetchAll)
		echo json_encode( $pdo -> query( $query ) -> fetchAll(PDO::FETCH_ASSOC) ,JSON_NUMERIC_CHECK);
	else
		echo json_encode( $pdo -> query( $query ) -> fetch(PDO::FETCH_ASSOC) ,JSON_NUMERIC_CHECK);
}

?>