<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

date_default_timezone_set('Europe/Saratov');

class Queue {
	public $file = 'queue_data.json';
	public $data = [
		'last_id' => 0,
		'data' => []
	];

	public function load() {
		! file_exists($this->file) ?:
			$this->data = json_decode(file_get_contents($this->file), true);
	}

	public function add(array $array) {
		$this->data['last_id'] += 1;
		$array['id'] = $this->data['last_id'];
		array_push($this->data['data'], $array);
	}

	public function remove(int $id) {
		$newArray = [];

		foreach ($this->data['data'] as $value) {
			$value['id'] === $id ?:
				array_push($newArray, $value);
		}
		
		$this->data['data'] = $newArray;
	}

	public function save() {
		file_put_contents($this->file, json_encode($this->data));
	}

}

class Log {
	public $file = 'logs.log';

	public function __construct() {
		if ( ! file_exists($this->file) ) {
			file_put_contents($this->file, '');
			chmod($this->file, 0644);
		}
	}

	public function add(string $action, string $type, $msg) {
		$currentDateTime = date('d.m.Y H:i:s', time());
		$arrayTypes = ['img', 'merged img'];

		if ( in_array($type, $arrayTypes) ) {
			$msg = $this->transformImg($msg);
		}

		$body = "------------------------------\nDatetime: {$currentDateTime}\nAction: {$action}\nType: {$type}\nMessage: {$msg}\n------------------------------\n\n";

		file_put_contents($this->file, $body, FILE_APPEND);

		new Response(201, ['status' => 'success']);
	}

	public function clear() {
		file_put_contents($this->file, '');

		new Response(200, ['status' => 'success']);
	}

	public function transformImg(array $msg) {
		$result = "\n";

		foreach ($msg as $subArray) {
		    foreach ($subArray as $row) {
		        foreach ($row as $value) {
		            if ($value === 1) {
		                $result .= "+";
		            } else {
		                $result .= " ";
		            }
		        }
		        $result .= "\n"; // переход на новую строку
		    }
		    $result .= "\n";
		}

		return $result;
	}
}

class Init {
	public function __construct() {
		$_SERVER['REQUEST_METHOD'] === 'POST' ?:
			new Response(403, ['msg' => 'POST only']);

		isset($_GET['method']) && $_GET['method'] ?:
			new Response(400, ['msg' => 'Не передан метод']);

		switch ($_GET['method']) {
			case 'queue-save':
				$body = json_decode(file_get_contents('php://input'), true);

				isset($body['name']) && $body['name'] && isset($body['data']) && $body['data'] ?:
					new Response(400, ['msg' => 'Не переданы name/data параметры']);

				$queue = new Queue();
				$queue->load();
				$queue->add($body);
				$queue->save();

				new Response(201, ['msg' => 'success']);
			break;

			case 'queue-load':
				$queue = new Queue();
				$queue->load();

				new Response(200, ['msg' => 'success', 'data' => $queue->data]);
			break;

			case 'queue-remove':
				$body = json_decode(file_get_contents('php://input'), true);

				isset($body['id']) && $body['id'] ?:
					new Response(400, ['msg' => 'Не передан id параметр']);

				$queue = new Queue();
				$queue->load();
				$queue->remove($body['id']);
				$queue->save();

				new Response(200, ['msg' => 'success']);
			break;

			case 'log-add':
				$body = json_decode(file_get_contents('php://input'), true);
				isset($body['log-action']) && $body['log-action'] && isset($body['log-type']) && $body['log-type'] && isset($body['log-msg']) && $body['log-msg'] ?:
					new Response(400, ['msg' => 'Не переданы необходимые параметры']);

				$log = new Log();

				$log->add($body['log-action'], $body['log-type'], $body['log-msg']);
			break;

			case 'log-clear':
				(new Log())->clear();
			break;

			default:
				new Response(403, ['msg' => 'Передан неизвестный метод']);
			break;
		}

		// $data = new Data();
		// $data->load();
	}
}

class Response {
	public function __construct(int $status = 200, array $data = []) {
		http_response_code($status);
		echo json_encode($data, JSON_UNESCAPED_UNICODE);
		exit();
	}
}



new Init();

?>