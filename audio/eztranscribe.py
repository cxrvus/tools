import os
import sys
import whisper


if len(sys.argv) < 2:
	print("<!> directory not provided")
	sys.exit(1)

path = sys.argv[1]
lang = sys.argv[2] if len(sys.argv) > 2 else 'en'

if not path or not os.path.isdir(path):
    print("<!> directory not provided or invalid")
    sys.exit(1)

if path[-1] == '/':
	path = path[:-1]

folder_name = path.split('/')[-1]

all_files = sorted(os.listdir(path))

files = list(filter(lambda file: file.lower().endswith(('mp3', 'wav', 'ogg')), all_files))
file_count = len(files)


model = whisper.load_model('base')

transcript = ''
outfile = os.path.join(path, '_' + folder_name) + '.md'


def get_header(file):
	file_name = '.'.join(file.split('.')[:-1])
	header_content = ''
	try:
		header_content = int(file_name[3:]) # numerical index as header
	except:
		header_content = file_name # file name as header
	return f'## {header_content}\n\n'	


print('transcribing...')

with open(outfile, 'w') as file:
	file.write('')


for (i, file) in enumerate(files):
	print(f'({i+1:02}/{file_count:02})')

	audio = whisper.load_audio(os.path.join(path, file))
	result = whisper.transcribe(model, audio, language=lang, fp16=False)	
	text = result['text']

	transcript += get_header(file)
	transcript += f'![[{file}]]\n\n'
	transcript += f'{text}\n\n'
	transcript += '\n'

	with open(outfile, 'w') as file:
		file.write(transcript)


print('done!')
