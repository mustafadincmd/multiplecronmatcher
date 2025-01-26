/*
	Cron Job Visualiser
	Copyright: Jon Richford
	Author: Jon Richford
	Version: 3.0
	
	About: Allows cron expressions to be plotted on a timeline.
	
	Instructions available at http://www.jonrichford.co.uk/projects
*/

function CronJobVisualiser() {
	var self = this;
	self.jobs = [];
	var jobCounter = 1;

	self.reset = function() {
		self.jobs = [];
		jobCounter = 1;
	}

	self.job = function(name, cron) {
		var parseCron = function(value, type) {
			var values = [];

			if (value === '*') {
				const range = type === 'hour' ? 24 : 60;
				for (let i = 0; i < range; i++) values.push(i);
			} else {
				value.split(',').forEach(part => {
					const [range, step = 1] = part.split('/');
					const [from, to = range] = range.split('-').map(Number);
					const stepValue = parseInt(step);

					if (stepValue) {
						for (let i = from; i <= (to || (type === 'hour' ? 23 : 59)); i += stepValue) {
							values.push(i);
						}
					} else {
						for (let i = from; i <= (to || (type === 'hour' ? 23 : 59)); i++) {
							values.push(i);
						}
					}
				});
			}

			return values;
		}

		var parts = cron.split(' ');
		var quartzExpression = parts.length === 6;

		return {
			minutes: parseCron(parts[quartzExpression ? 1 : 0], 'minute'),
			hours: parseCron(parts[quartzExpression ? 2 : 1], 'hour'),
			cron,
			name,
		}
	}

	self.add = function(name, cronExpression) {
		self.jobs.push(self.job(name, cronExpression));
		
		var existingTable = document.querySelector('.CronJobVisualiser');
		if (existingTable) {
			existingTable.parentNode.removeChild(existingTable);
		}
		
		var newTable = self.buildTable(0, 23, false);
		document.body.appendChild(newTable);

		var footer = document.createElement('footer');
		footer.innerHTML = '<p style="text-align: center; margin-top: 20px;">&copy; Created by <a href="https://www.linkedin.com/in/mustafadincmd/" target="_blank">Mustafa Dinç</a></p>';
		document.body.appendChild(footer);
	}

	self.buildTable = function(startHour, endHour, printable) {
		var today = new Date();
		today.setHours(0);
		today.setMinutes(0);

		startHour = (typeof startHour != 'undefined') ? startHour : 0;
		endHour = (typeof endHour != 'undefined') ? endHour : 23;

		var table = document.createElement('table');
		table.className = 'CronJobVisualiser';

		var headerRow = document.createElement('tr');
		var emptyCell = document.createElement('td');
		emptyCell.className = 'hour';
		emptyCell.innerHTML = '&nbsp;';
		headerRow.appendChild(emptyCell);
		for (var minute = 0; minute < 60; minute++) {
			var minuteCell = document.createElement('td');
			minuteCell.innerHTML = (minute < 10 ? '0' + minute : minute);
			headerRow.appendChild(minuteCell);
		}
		table.appendChild(headerRow);

		for (var hour = startHour; hour <= endHour; hour++) {
			var row = document.createElement('tr');
			var hourCell = document.createElement('td');
			hourCell.className = 'hour';
			hourCell.innerHTML = (hour < 10 ? '0' + hour : hour) + ':00';
			row.appendChild(hourCell);

			for (var minute = 0; minute < 60; minute++) {
				var jobHtml = '&nbsp;';
				var colorClass = '';

				for (var i = 0; i < self.jobs.length; i++) {
					var job = self.jobs[i];
					if (job.hours.includes(hour) && job.minutes.includes(minute)) {
						if (colorClass === '') {
							colorClass = 'running';
						} else {
							colorClass = 'running-alt';
						}
					}
				}

				var cell = document.createElement('td');
				if (colorClass) {
					jobHtml = '<div class="' + colorClass + '">&nbsp;</div>';
				}
				cell.innerHTML = jobHtml;
				row.appendChild(cell);
			}
			table.appendChild(row);
		}

		return table;
	}

	self.build = function(startHour, endHour) {
		var container = document.createElement('section');
		container.className = 'cron-container';

		document.getElementById('addJobButton').addEventListener('click', function() {
			var cronExpression = document.getElementById('cronInput').value.trim();
			if (cronExpression) {
				var jobName = "Job " + jobCounter;
				self.add(jobName, cronExpression);
				jobCounter++;
			} else {
				alert("Please enter a cron expression.");
			}
		});

		document.body.appendChild(container);
	}

	self.getCronDescription = function(cronExpression) {
		return "Cron Expression: " + cronExpression;
	}
}

var myTimeline = new CronJobVisualiser();

myTimeline.build();
